import { Iso } from "../models";
import { allowedISOStandards, ISOStandard } from "../constants/iso.constants";
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { calculateExpiryStatus } from "../utils/status.util";
import { ISO, ISOQuery, CreateISOData, UpdateISOData } from "../interfaces/model.interface";

export class ISOService {
  /**
   * Helper: Format ISO for list view (without S3 calls)
   */
  private static formatISOForList(iso: ISO) {
    return {
      ...iso,
      status: calculateExpiryStatus(iso.expiryDate),
      hasFile: !!iso.fileKey,
    };
  }

  /**
   * Helper: Format ISO with S3 URL
   */
  private static async formatISO(iso: ISO) {
    return {
      ...iso,
      status: calculateExpiryStatus(iso.expiryDate),
      fileUrl: iso.fileKey ? await FileUploadService.generateDownloadUrl(iso.fileKey) : null,
    };
  }

  /**
   * Create a new ISO certificate
   */
  static async create(data: CreateISOData): Promise<ISO> {
    try {
      if (!allowedISOStandards.includes(data.isoStandard as ISOStandard)) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_ISO_STANDARD);
      }

      if (data.fileKey) {
        await validateS3Keys([data.fileKey]);
      }

      const iso = await Iso.create(data);
      return iso.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ISOService', method: 'create', data });
    }
  }

  /**
   * Get all ISO certificates with pagination and filtering
   */
  static async getAll(query: ISOQuery): Promise<any> {
    try {
      const searchableFields = ['certificateName', 'isoStandard', 'certifyingBody'];
      const allowedSortFields = ['certificateName', 'isoStandard', 'certifyingBody', 'issueDate', 'expiryDate', 'createdAt', 'updatedAt'];
      const filterFields = ['isoStandard', 'status'];

      const result = await PaginationService.paginate(Iso, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Format ISOs without expensive S3 calls
      const formatted = result.data.map((iso) => this.formatISOForList(iso as ISO));

      return {
        isos: formatted,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ISOService', method: 'getAll', query });
    }
  }

  /**
   * Get ISO certificate by ID
   */
  static async getOne(id: string): Promise<any> {
    try {
      const iso = await Iso.findById(id).lean();
      
      if (!iso) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ISO_NOT_FOUND);
      }

      return await this.formatISO(iso as unknown as ISO);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ISOService', method: 'getOne', id });
    }
  }

  /**
   * Update ISO certificate by ID
   */
  static async update(id: string, data: UpdateISOData): Promise<any> {
    try {
      const existing = await Iso.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ISO_NOT_FOUND);
      }

      if (data.isoStandard && !allowedISOStandards.includes(data.isoStandard as ISOStandard)) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_ISO_STANDARD);
      }

      // Handle file update
      if (data.fileKey && data.fileKey !== existing.fileKey) {
        // Validate new file
        await validateS3Keys([data.fileKey]);
        
        // Delete old file if it exists
        if (existing.fileKey) {
          await FileUploadService.deleteFiles([existing.fileKey]);
        }
      }

      const updated = await Iso.findByIdAndUpdate(
        id,
        data,
        { new: true, lean: true }
      );

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ISO_NOT_FOUND);
      }

      return await this.formatISO(updated as unknown as ISO);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ISOService', method: 'update', id, data });
    }
  }

  /**
   * Delete ISO certificate by ID
   */
  static async remove(id: string): Promise<void> {
    try {
      const existing = await Iso.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ISO_NOT_FOUND);
      }

      const fileKey = existing.fileKey;
      
      await Iso.findByIdAndDelete(id);
      
      if (fileKey) {
        try {
          await FileUploadService.deleteFiles([fileKey]);
        } catch (error) {
          console.error('Failed to delete S3 file:', fileKey, error);
        }
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ISOService', method: 'remove', id });
    }
  }

  /**
   * Get ISO statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await Iso.countDocuments();

      return { total };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ISOService', method: 'getStats' });
    }
  }
}
