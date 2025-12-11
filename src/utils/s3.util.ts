
// TEMPORARILY DISABLED S3 FOR DEVELOPMENT
export const uploadBufferToS3 = async (
  _buffer: Buffer,
  _originalName: string,
  _mimeType: string
) => {
  console.log("⚠ uploadBufferToS3 skipped (TEMP DISABLED)");

  // ✅ MUST RETURN ONLY STRING (documentKey)
  return "temp-file-key";
};

export const getPresignedUrl = async (_key: string) => {
  console.log("⚠ getPresignedUrl skipped (TEMP DISABLED)");

  // You can return dummy URL, presigned URL is string only
  return "https://dummy-url.com/presigned-url";
};

export const uploadToS3 = async (_file: Express.Multer.File) => {
  console.log("⚠ uploadToS3 skipped (TEMP DISABLED)");

  // This util is not used in license module, but keep same format
  return "temp-file-key";
};

export const deleteFromS3 = async (_key: string) => {
  console.log("⚠ deleteFromS3 skipped (TEMP DISABLED)");
  return true;
};


// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import dotenv from 'dotenv';
// import crypto from 'crypto';
// dotenv.config();

// const REGION = process.env.AWS_REGION;
// const BUCKET = process.env.S3_BUCKET_NAME;
// if (!REGION || !BUCKET) throw new Error('S3 config missing in env');

// const s3 = new S3Client({
//   region: REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
//   }
// });

// export const uploadBufferToS3 = async (buffer: Buffer, filename: string, contentType = 'application/pdf') => {
//   const key = `licenses/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${filename}`;
//   const cmd = new PutObjectCommand({
//     Bucket: BUCKET,
//     Key: key,
//     Body: buffer,
//     ContentType: contentType
//   });
//   await s3.send(cmd);
//   return key; // store this key in DB
// };

// export const getPresignedUrl = async (key: string, expiresIn = Number(process.env.S3_URL_EXPIRY ?? 900)) => {
//   const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
//   return await getSignedUrl(s3, cmd, { expiresIn });
// };
