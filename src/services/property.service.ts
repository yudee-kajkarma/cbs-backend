import { Property as PropertyModel } from "../models";
import { Property, PropertyQuery, CreatePropertyData, UpdatePropertyData } from "../interfaces";
import { PaginationService } from './pagination.service';
import { throwError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants';

/**
 * PropertyService
 * @description Service for property operations
 */
export class PropertyService {
  /**
   * Create a new property
   * @param data - Property data
   * @returns Created property
   */
  static async create(data: Partial<Property>) {
    try {
      const property = await PropertyModel.create(data);
      return property.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PropertyService', method: 'create', data });
    }
  }

  /**
   * Get all properties with pagination
   * @param query - Query parameters
   * @returns Paginated property list
   */
  static async getAll(query: PropertyQuery) {
    try {
      const searchableFields = ['propertyName', 'location', 'titleDeedNumber'];
      const allowedSortFields = [
        'propertyName',
        'propertyType',
        'location',
        'area',
        'ownershipType',
        'status',
        'purchaseDate',
        'purchaseValue',
        'currentValue',
        'insuranceExpiryDate',
        'createdAt',
        'updatedAt'
      ];
      const filterFields = ['propertyType', 'propertyUsage', 'ownershipType', 'status', 'location'];

      const result = await PaginationService.paginate(PropertyModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        properties: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PropertyService', method: 'getAll', query });
    }
  }

  /**
   * Get property by ID
   * @param id - Property ID
   * @returns Property details
   */
  static async getById(id: string) {
    try {
      const property = await PropertyModel.findById(id).lean();
      if (!property) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PROPERTY_NOT_FOUND);
      }
      return property;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PropertyService', method: 'getById', id });
    }
  }

  /**
   * Update property by ID
   * @param id - Property ID
   * @param data - Update data
   * @returns Updated property
   */
  static async update(id: string, data: Partial<Property>) {
    try {
      const updated = await PropertyModel.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true, lean: true }
      );
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PROPERTY_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PropertyService', method: 'update', id, data });
    }
  }

  /**
   * Delete property by ID
   * @param id - Property ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await PropertyModel.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PROPERTY_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PropertyService', method: 'delete', id });
    }
  }

  /**
   * Get property statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await PropertyModel.countDocuments();
      const active = await PropertyModel.countDocuments({ status: 'Active' });
      const inactive = await PropertyModel.countDocuments({ status: { $ne: 'Active' } });

      return { total, active, inactive };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PropertyService', method: 'getStats' });
    }
  }
}
