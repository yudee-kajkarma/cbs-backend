import License from "../models/license.model";
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { calculateExpiryStatus } from "../utils/status.util";
import { LicenseQuery, CreateLicenseData, UpdateLicenseData } from "../interfaces/model.interface";

export class LicenseService {
  /**
   * Helper: Format license for list view (without S3 calls)
   */
  private static formatLicenseForList(license: any) {
    return {
      ...license,
      status: calculateExpiryStatus(license.expiryDate),
      hasDocument: !!license.documentKey,
    };
  }

  /**
   * Helper: Format license with S3 URL
   */
  private static async formatLicense(license: any) {
    return {
      ...license,
      status: calculateExpiryStatus(license.expiryDate),
      documentUrl: license.documentKey
        ? await FileUploadService.generateDownloadUrl(license.documentKey)
        : null,
    };
  }

  /**
   * Create a new license
   */
  static async create(data: CreateLicenseData): Promise<any> {
    try {
      if (data.documentKey) {
        await validateS3Keys([data.documentKey]);
      }

      const license = await License.create(data);
      return license.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LicenseService', method: 'create', data });
    }
  }

  /**
   * Get all licenses with pagination and filtering
   */
  static async getAll(query: LicenseQuery): Promise<any> {
    try {
      const searchableFields = ['name', 'number', 'issuingAuthority'];
      const allowedSortFields = ['name', 'type', 'issueDate', 'expiryDate', 'createdAt', 'updatedAt'];
      const filterFields = ['type', 'status'];

      const result = await PaginationService.paginate(License, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Format licenses without expensive S3 calls
      const formatted = result.data.map((license: any) => this.formatLicenseForList(license));

      return {
        licenses: formatted,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LicenseService', method: 'getAll', query });
    }
  }

  /**
   * Get license by ID
   */
  static async getOne(id: string): Promise<any> {
    try {
      const license = await License.findById(id).lean();
      
      if (!license) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LICENSE_NOT_FOUND);
      }

      return await this.formatLicense(license);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LicenseService', method: 'getOne', id });
    }
  }

  /**
   * Update license by ID
   */
  static async update(id: string, data: UpdateLicenseData): Promise<any> {
    try {
      const existing = await License.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LICENSE_NOT_FOUND);
      }

      // Handle file update
      if (data.documentKey && data.documentKey !== existing.documentKey) {
        // Validate new file
        await validateS3Keys([data.documentKey]);
        
        // Delete old file if it exists
        if (existing.documentKey) {
          await FileUploadService.deleteFiles([existing.documentKey]);
        }
      }

      const updated = await License.findByIdAndUpdate(
        id,
        data,
        { new: true, lean: true }
      );

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LICENSE_NOT_FOUND);
      }

      return await this.formatLicense(updated);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LicenseService', method: 'update', id, data });
    }
  }

  /**
   * Delete license by ID
   */
  static async remove(id: string): Promise<void> {
    try {
      const existing = await License.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LICENSE_NOT_FOUND);
      }

      const documentKey = existing.documentKey;
      
      await License.findByIdAndDelete(id);
      
      if (documentKey) {
        try {
          await FileUploadService.deleteFiles([documentKey]);
        } catch (error) {
          console.error('Failed to delete S3 file:', documentKey, error);
        }
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LicenseService', method: 'remove', id });
    }
  }
}
