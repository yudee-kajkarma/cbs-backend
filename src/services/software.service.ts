import { Software } from "../models";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants";
import { CreateSoftwareData, ISoftware, SoftwareQuery } from "../interfaces";

/**
 * SoftwareService
 * @description Service for software operations
 */
export class SoftwareService {
  /**
   * Create a new software
   * @param data - Software data
   * @returns Created software
   */
  static async create(data: CreateSoftwareData) {
    try {
      return await Software.create(data);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SoftwareService', method: 'create', data });
    }
  }

  /**
   * Get all software with pagination
   * @param query - Query parameters
   * @returns Paginated software list
   */
  static async getAll(query: SoftwareQuery) {
    try {
      const searchableFields = ['softwareName', 'version', 'vendor'];
      const allowedSortFields = ['softwareName', 'version', 'vendor', 'licenseType', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['licenseType', 'status'];

      const result = await PaginationService.paginate(Software, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        softwares: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SoftwareService', method: 'getAll', query });
    }
  }

  /**
   * Get software by ID
   * @param id - Software ID
   * @returns Software details
   */
  static async getById(id: string) {
    try {
      const software = await Software.findById(id);
      if (!software) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SOFTWARE_NOT_FOUND);
      }
      return software;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SoftwareService', method: 'getById', id });
    }
  }

  /**
   * Update software by ID
   * @param id - Software ID
   * @param data - Update data
   * @returns Updated software
   */
  static async update(id: string, data: Partial<ISoftware>) {
    try {
      const updated = await Software.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SOFTWARE_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SoftwareService', method: 'update', id, data });
    }
  }

  /**
   * Delete software by ID
   * @param id - Software ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await Software.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SOFTWARE_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SoftwareService', method: 'delete', id });
    }
  }

  /**
   * Get software statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await Software.countDocuments();
      const active = await Software.countDocuments({ status: 'Active' });
      
      // Count expired software (expiry date passed)
      const now = new Date();
      const expired = await Software.countDocuments({ 
        expiryDate: { $lt: now }
      });

      return { total, active, expired };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SoftwareService', method: 'getStats' });
    }
  }
}