import Metadata from "../models/metadata.model";
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
}
