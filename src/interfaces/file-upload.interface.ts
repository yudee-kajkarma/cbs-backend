export interface FileUploadMetadata {
  filename: string;
  mimeType: string;
  size: number;
  fileType: 'image' | 'video' | 'certificate';
}

export interface PresignedUrlRequest {
  type: string; // gem, customer, etc.
  files: FileUploadMetadata[];
}

export interface PresignedUrlResponse {
  files: Array<{
    filename: string;
    presignedUrl: string;
    s3Key: string;
    publicUrl?: string; // For images and videos (public files)
    expiresIn: number;
  }>;
}

export interface FileValidationRules {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  maxFilesPerType: number;
}

// S3 file information returned by verifyUploadedFiles method
// IMPORTANT: This interface MUST match the actual implementation in file-upload-service.ts
export interface S3FileInfo {
  key: string; // S3 key path
  bucket: string; // S3 bucket name
  region: string; // AWS region
  originalName: string; // Original filename from metadata
  mimeType: string; // Content type
  size: number; // File size in bytes
  uploadedAt: string; // Upload timestamp as ISO string
  url: string; // Full S3 URL
}
