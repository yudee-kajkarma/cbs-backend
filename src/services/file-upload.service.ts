import { S3Client, HeadObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from '../config/config';
import { throwError } from '../utils/errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { withRetry } from '../utils/retry.util';
import { getCurrentUTCDate } from '../utils/common.util';
import {
  FileUploadMetadata,
  PresignedUrlRequest,
  PresignedUrlResponse,
  FileValidationRules,
  S3FileInfo,
} from '../interfaces/file-upload.interface';

// Initialize S3 Client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  requestChecksumCalculation: "WHEN_REQUIRED", 
  responseChecksumValidation: "WHEN_REQUIRED",
  
});

export class FileUploadService {
  // File validation rules - SECURITY CHECKPOINT
  private static readonly VALIDATION_RULES: Record<string, FileValidationRules> = {
    video: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
      maxFilesPerType: 5,
    },
    document: {
      maxFileSize: 20 * 1024 * 1024, // 20MB
      allowedMimeTypes: [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/webp', 
        'image/gif',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'text/plain', // .txt
        'text/csv', // .csv
      ],
      maxFilesPerType: 10,
    },
  };

  /**
   * Validate file metadata against security rules
   * This is the critical security checkpoint
   */
  private static validateFileMetadata(files: FileUploadMetadata[]): void {
    if (!files || files.length === 0) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_FILE_METADATA);
    }

    // Group files by type for validation
    const filesByType: Record<string, FileUploadMetadata[]> = {};

    for (const file of files) {
      // Validate file type
      if (!file.fileType || !this.VALIDATION_RULES[file.fileType]) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_FILE_TYPE);
      }

      const rules = this.VALIDATION_RULES[file.fileType];

      // Validate file size with specific details
      if (file.size > rules.maxFileSize) {
        const maxSizeMB = (rules.maxFileSize / (1024 * 1024)).toFixed(0);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        throw throwError({
          ...ERROR_MESSAGES.CLIENT_ERRORS.FILE_TOO_LARGE,
          message: `File '${file.filename}' is ${fileSizeMB}MB, but ${file.fileType} files must be under ${maxSizeMB}MB`,
        });
      }

      // Validate MIME type with specific details
      if (!rules.allowedMimeTypes.includes(file.mimeType)) {
        throw throwError({
          ...ERROR_MESSAGES.CLIENT_ERRORS.INVALID_FILE_FORMAT,
          message: `File '${file.filename}' has invalid MIME type '${file.mimeType}'. Allowed types for ${file.fileType}: ${rules.allowedMimeTypes.join(', ')}`,
        });
      }

      // Validate filename
      if (!file.filename || file.filename.trim().length === 0) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_FILENAME);
      }

      // Group by type for count validation
      if (!filesByType[file.fileType]) {
        filesByType[file.fileType] = [];
      }
      filesByType[file.fileType].push(file);
    }

    // Validate file count per type
    for (const [fileType, typeFiles] of Object.entries(filesByType)) {
      const rules = this.VALIDATION_RULES[fileType];
      if (typeFiles.length > rules.maxFilesPerType) {
        throw throwError({
          ...ERROR_MESSAGES.CLIENT_ERRORS.TOO_MANY_FILES,
          message: `Too many ${fileType} files. Maximum ${rules.maxFilesPerType} files allowed, but ${typeFiles.length} provided`,
        });
      }
    }
  }

  /**
   * Generate presigned URLs for file uploads
   * This is the secure gatekeeper endpoint
   */
  static async generatePresignedUrls(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    try {
      // SECURITY CHECKPOINT: Validate all file metadata
      this.validateFileMetadata(request.files);

      const tenantBucket = config.aws.s3BucketName;

      const uploadUrls = await Promise.all(
        request.files.map(async file => {
          // Generate unique S3 key based on file type and visibility
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1e9);

          // Determine directory structure based on file type
          let key: string;

          if (file.fileType === 'document') {
            // Documents go to private folder
            key = `cbs/private/${request.type}/${timestamp}_${randomSuffix}_${file.filename}`;
          } else {
            // Videos go to public folder
            key = `cbs/public/${request.type}/${file.fileType}s/${timestamp}_${randomSuffix}_${file.filename}`;
          }

          // Generate presigned URL with retry logic
          const presignedUrl = await withRetry(
            async () => {
              const command = new PutObjectCommand({
                Bucket: tenantBucket,
                Key: key,
                ContentType: file.mimeType,
                // Metadata: {
                //   originalName: file.filename,
                //   fileType: file.fileType,
                //   uploadedAt: getCurrentUTCDate().toISOString(),
                // },
              });
              
              return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            },
            {
              retries: 3,
              factor: 2,
              minTimeout: 1000,
              maxTimeout: 10000,
              randomize: true,
            }
          );

          // Generate public URL for videos only (documents are private)
          let publicUrl: string | undefined;
          if (file.fileType !== 'document') {
            publicUrl = `https://${tenantBucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
          }

          return {
            filename: file.filename,
            presignedUrl,
            s3Key: key,
            publicUrl,
            expiresIn: 3600,
          };
        })
      );

      return {
        files: uploadUrls,
      };
    } catch (error: any) {
      if (error.code && error.code.startsWith('CL-')) {
        throw error; // Re-throw client errors
      }

      console.error('Presigned URL generation error:', error);
      throw throwError(ERROR_MESSAGES.SERVER_ERRORS.FAILED_TO_GENERATE_PRESIGNED_URL);
    }
  }

  /**
   * Verify uploaded files exist in S3
   */
  static async verifyUploadedFiles(keys: string[]): Promise<S3FileInfo[]> {
    try {
      const tenantBucket = config.aws.s3BucketName;

      const fileInfos = await Promise.all(
        keys.map(async key => {
          return withRetry(
            async () => {
              const command = new HeadObjectCommand({
                Bucket: tenantBucket,
                Key: key,
              });
              
              const headResult = await s3Client.send(command);

              return {
                key,
                bucket: tenantBucket,
                region: config.aws.region,
                originalName: headResult.Metadata?.originalname || key.split('/').pop() || '',
                mimeType: headResult.ContentType || 'application/octet-stream',
                size: headResult.ContentLength || 0,
                uploadedAt: headResult.Metadata?.uploadedat || getCurrentUTCDate().toISOString(),
                url: `https://${tenantBucket}.s3.${config.aws.region}.amazonaws.com/${key}`,
              };
            },
            {
              retries: 2,
              factor: 2,
              minTimeout: 1000,
              maxTimeout: 5000,
              randomize: true,
            }
          );
        })
      );

      return fileInfos;
    } catch (error) {
      console.error('File verification error:', error);
      throw throwError(ERROR_MESSAGES.SERVER_ERRORS.FAILED_TO_VERIFY_FILES);
    }
  }

  /**
   * Get file information for a single file (throws error if not found)
   */
  static async getFileInfo(key: string): Promise<S3FileInfo> {
    try {
      const fileInfos = await this.verifyUploadedFiles([key]);

      if (fileInfos.length === 0) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FILE_NOT_FOUND);
      }

      return fileInfos[0];
    } catch (error) {
      // If it's already a custom error, rethrow it
      if ((error as any).code && (error as any).code.startsWith('CL-')) {
        throw error;
      }
      // Otherwise wrap it or rethrow
      throw error;
    }
  }

  /**
   * Delete files from S3 (for cleanup)
   */
  static async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;

      const tenantBucket = config.aws.s3BucketName;

      await withRetry(
        async () => {
          const command = new DeleteObjectsCommand({
            Bucket: tenantBucket,
            Delete: {
              Objects: keys.map(key => ({ Key: key })),
            },
          });
          
          await s3Client.send(command);
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 10000,
          randomize: true,
        }
      );
    } catch (error) {
      console.error('File deletion error:', error);
      throw throwError(ERROR_MESSAGES.SERVER_ERRORS.FAILED_TO_DELETE_FILES);
    }
  }

  /**
   * Generate presigned URL for file download/viewing
   */
  static async generateDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const tenantBucket = config.aws.s3BucketName;

      return await withRetry(
        async () => {
          const command = new GetObjectCommand({
            Bucket: tenantBucket,
            Key: key,
          });
          
          return await getSignedUrl(s3Client, command, { expiresIn });
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 10000,
          randomize: true,
        }
      );
    } catch (error) {
      console.error('Download URL generation error:', error);
      throw throwError(ERROR_MESSAGES.SERVER_ERRORS.FAILED_TO_GENERATE_DOWNLOAD_URL);
    }
  }
}
