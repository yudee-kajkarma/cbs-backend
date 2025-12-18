import { FurnitureModel } from "../models/furniture.model";
import { Furniture, FurnitureQuery, CreateFurnitureData, UpdateFurnitureData } from "../interfaces";
import { PaginationService } from './pagination.service';
import { throwError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants';

/**
 * FurnitureService
 * @description Service for furniture operations
 */
export class FurnitureService {
  /**
   * Create a new furniture
   * @param data - Furniture data
   * @returns Created furniture
   */
  static async create(data: CreateFurnitureData) {
    try {
      return await FurnitureModel.create(data);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'FurnitureService', method: 'create', data });
    }
  }

  /**
   * Get all furniture with pagination
   * @param query - Query parameters
   * @returns Paginated furniture list
   */
  static async getAll(query: FurnitureQuery) {
    try {
      const searchableFields = ['itemName', 'itemCode', 'location'];
      const allowedSortFields = ['itemName', 'itemCode', 'category', 'status', 'location', 'createdAt', 'updatedAt'];
      const filterFields = ['category', 'status', 'location', 'createdAt', 'updatedAt'];

      const result = await PaginationService.paginate(FurnitureModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        furnitures: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'FurnitureService', method: 'getAll', query });
    }
  }

  /**
   * Get furniture by ID
   * @param id - Furniture ID
   * @returns Furniture details
   */
  static async getById(id: string) {
    try {
      const furniture = await FurnitureModel.findById(id);
      if (!furniture) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FURNITURE_NOT_FOUND);
      }
      return furniture;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'FurnitureService', method: 'getById', id });
    }
  }

  /**
   * Update furniture by ID
   * @param id - Furniture ID
   * @param data - Update data
   * @returns Updated furniture
   */
  static async update(id: string, data: UpdateFurnitureData) {
    try {
      const updated = await FurnitureModel.findByIdAndUpdate(id, data, { new: true });
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FURNITURE_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'FurnitureService', method: 'update', id, data });
    }
  }

  /**
   * Delete furniture by ID
   * @param id - Furniture ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await FurnitureModel.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FURNITURE_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'FurnitureService', method: 'delete', id });
    }
  }
}

