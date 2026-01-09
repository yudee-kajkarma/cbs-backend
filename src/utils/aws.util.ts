/**
 * AWS/S3 utility functions for file validation and operations
 */

import { FileUploadService } from '../services/file-upload.service';
import { throwError } from './errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { convertS3KeysToPublicUrls } from './common.util';

/**
 * Validate S3 keys exist in the bucket
 * @param keys - Array of S3 keys to validate
 * @returns Promise<string[]> - Array of valid keys
 */
export async function validateS3Keys(keys: string[]): Promise<string[]> {
  if (!keys || keys.length === 0) return [];

  try {
    // Verify that all keys exist in S3
    const fileInfos = await FileUploadService.verifyUploadedFiles(keys);

    // Return only the keys that exist
    return fileInfos.map(file => file.key);
  } catch (error) {
    console.error('S3 key validation error:', error);
    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_S3_KEYS);
  }
}

/**
 * Extract and validate all S3 keys from media data (works for both create and update)
 * @param data - Any object with media fields (videos, documents)
 * @returns Promise<void>
 */
export async function validateMediaKeys(data: any): Promise<void> {
  const allKeys: string[] = [];

  // Collect all S3 keys from media fields
  if (data.videos?.keys) {
    allKeys.push(...data.videos.keys);
  }
  if (data.documents?.keys) {
    allKeys.push(...data.documents.keys);
  }

  if (allKeys.length === 0) return;

  // Validate all keys exist in S3
  const validKeys = await validateS3Keys(allKeys);

  // Check if any keys are missing
  const missingKeys = allKeys.filter(key => !validKeys.includes(key));
  if (missingKeys.length > 0) {
    throw throwError({
      code: 'CL-40024',
      message: `The following S3 keys do not exist: ${missingKeys.join(', ')}`,
      status: 400,
    });
  }

  // Convert S3 keys to public URLs for videos only (documents are private)
  if (data.videos?.keys && data.videos.keys.length > 0) {
    data.videos.urls = convertS3KeysToPublicUrls(data.videos.keys);
    // Remove keys property since we don't store keys for public media
    delete data.videos.keys;
  }
  // Documents remain as keys (private, not converted to public URLs)
}

/**
 * Check if media fields contain S3 keys that need validation
 * @param data - Any object with media fields
 * @returns boolean - True if validation is needed
 */
export function hasMediaKeys(data: any): boolean {
  return !!(data.videos?.keys || data.documents?.keys);
}
