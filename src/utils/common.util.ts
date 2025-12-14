import { config } from '../config/config';

export function getCurrentUTCDate(): Date {
  return new Date();
}

export function convertS3KeysToPublicUrls(keys: string[]): string[] {
  if (!keys || keys.length === 0) return [];
  
  const bucket = config.aws.s3BucketName;
  const region = config.aws.region;
  
  return keys.map(key => `https://${bucket}.s3.${region}.amazonaws.com/${key}`);
}
