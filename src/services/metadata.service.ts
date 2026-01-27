import { Request } from "express";
import { Metadata } from "../models";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  MetadataDocument,
  UpdateMetadataData
} from "../interfaces/model.interface";

export class MetadataService {
  
  /**
   * Create or update metadata 
   */
  static async createOrUpdate(data: UpdateMetadataData): Promise<MetadataDocument> {
    try {
      const existingMetadata = await Metadata.findOne();
      
      if (existingMetadata) {
        const updated = await Metadata.findByIdAndUpdate(
          existingMetadata._id,
          { $set: data },
          { new: true, lean: true }
        );
        return updated as MetadataDocument;
      } else {
        const metadata = await Metadata.create(data);
        return metadata.toObject();
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'MetadataService', method: 'createOrUpdate', data });
    }
  }

  /**
   * Get the single metadata
   */
  static async get(): Promise<MetadataDocument> {
    try {
      const metadata = await Metadata.findOne().lean();
      
      if (!metadata) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.METADATA_NOT_FOUND);
      }
      
      return metadata as MetadataDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'MetadataService', method: 'get' });
    }
  }

  /**
   * Get company IP ranges from metadata with request-level caching
   * Uses request object to cache results for the duration of a single request
   * @param req - Express request object (optional, for caching)
   * @returns Array of CIDR IP ranges, empty array if not found (fail-secure)
   */
  static async getCompanyIpRanges(req?: Request): Promise<string[]> {
    try {
      // Request-level cache check
      if (req && (req as any).cachedCompanyIpRanges !== undefined) {
        return (req as any).cachedCompanyIpRanges;
      }
      
      const metadata = await Metadata.findOne()
        .select('companyIpRanges')
        .lean();
      
      const ranges = metadata?.companyIpRanges || [];
      
      // Cache in request object for subsequent calls in same request
      if (req) {
        (req as any).cachedCompanyIpRanges = ranges;
      }
      
      return ranges;
    } catch (error) {
      // Fail-secure: log error and return empty array (don't throw)
      console.error('MetadataService getCompanyIpRanges error:', {
        serviceName: 'MetadataService',
        method: 'getCompanyIpRanges',
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
}
