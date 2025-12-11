
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { config } from '../config/config';

const { region, s3BucketName, accessKeyId, secretAccessKey, urlExpiry } = config.aws;

// Check if S3 is configured
const isS3Configured = !!(region && s3BucketName && accessKeyId && secretAccessKey);

let s3: S3Client | null = null;

if (isS3Configured) {
  s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

/**
 * Upload a buffer to S3
 * @param buffer - File buffer
 * @param originalName - Original filename
 * @param mimeType - MIME type of the file
 * @returns S3 key
 */
export const uploadBufferToS3 = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> => {
  if (!s3 || !isS3Configured) {
    console.warn("⚠ S3 not configured - returning mock file key");
    return `temp-${Date.now()}-${originalName}`;
  }

  const key = `uploads/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${originalName}`;
  
  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType
  });

  await s3.send(command);
  return key;
};

/**
 * Upload a Multer file to S3
 * @param file - Multer file object
 * @returns S3 key
 */
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  return uploadBufferToS3(file.buffer, file.originalname, file.mimetype);
};

/**
 * Get a presigned URL for an S3 object
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 900 = 15 minutes)
 * @returns Presigned URL
 */
export const getPresignedUrl = async (
  key: string,
  expiresIn: number = urlExpiry
): Promise<string> => {
  if (!s3 || !isS3Configured) {
    console.warn("⚠ S3 not configured - returning mock URL");
    return `https://dummy-url.com/presigned/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: s3BucketName,
    Key: key
  });

  return await getSignedUrl(s3, command, { expiresIn });
};

/**
 * Generate presigned URLs for multiple keys in batch
 * More efficient than calling getPresignedUrl multiple times
 * @param keys - Array of S3 object keys
 * @param expiresIn - URL expiration time in seconds
 * @returns Map of key to presigned URL
 */
export const batchGetPresignedUrls = async (
  keys: string[],
  expiresIn: number = urlExpiry
): Promise<Record<string, string>> => {
  if (!s3 || !isS3Configured) {
    console.warn("⚠ S3 not configured - returning mock URLs");
    const urlMap: Record<string, string> = {};
    keys.forEach(key => {
      urlMap[key] = `https://dummy-url.com/presigned/${key}`;
    });
    return urlMap;
  }

  const urlPromises = keys.map(async (key) => {
    const url = await getPresignedUrl(key, expiresIn);
    return { key, url };
  });

  const results = await Promise.all(urlPromises);
  
  const urlMap: Record<string, string> = {};
  results.forEach(({ key, url }) => {
    urlMap[key] = url;
  });

  return urlMap;
};

/**
 * Delete an object from S3
 * @param key - S3 object key
 * @returns True if successful
 */
export const deleteFromS3 = async (key: string): Promise<boolean> => {
  if (!s3 || !isS3Configured) {
    console.warn("⚠ S3 not configured - skipping delete");
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: s3BucketName,
      Key: key
    });

    await s3.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
};
