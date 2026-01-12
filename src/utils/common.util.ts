import { config } from '../config/config';
import { getTenantContext } from './tenant-context';

export function getCurrentUTCDate(): Date {
  return new Date();
}

export function convertS3KeysToPublicUrls(keys: string[]): string[] {
  if (!keys || keys.length === 0) return [];
  
  // Use tenant-specific bucket
  const tenantContext = getTenantContext();
  const tenantRefId = tenantContext.tenantId;
  const env = config.env;
  const bucket = `cbs-${tenantRefId.toLowerCase()}`;
  const region = config.aws.region;
  
  return keys.map(key => `https://${bucket}.s3.${region}.amazonaws.com/${key}`);
}
