import { NewHardwareModel } from "../models/newhardware.model";
import { NewHardware, NewHardwareQuery, CreateNewHardwareData, UpdateNewHardwareData } from "../interfaces";
import { PaginationService } from './pagination.service';
import { throwError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants';

/**
 * NewHardwareService
 * @description Service for new hardware operations
 */
export class NewHardwareService {
  /**
   * Create a new hardware
   * @param data - Hardware data
   * @returns Created hardware
   */
  static async create(data: NewHardware) {
    try {
      return await NewHardwareModel.create(data);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NewHardwareService', method: 'create', data });
    }
  }

  /**
   * Get all hardware with pagination
   * @param query - Query parameters
   * @returns Paginated hardware list
   */
  static async getAll(query: NewHardwareQuery) {
    try {
      const searchableFields = ['deviceName', 'serialNumber', 'assignedTo'];
      const allowedSortFields = ['deviceName', 'serialNumber', 'type', 'operatingSystem', 'department', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['type', 'operatingSystem', 'department', 'status'];

      const result = await PaginationService.paginate(NewHardwareModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        newHardwares: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NewHardwareService', method: 'getAll', query });
    }
  }

  /**
   * Get hardware by ID
   * @param id - Hardware ID
   * @returns Hardware details
   */
  static async getById(id: string) {
    try {
      const hardware = await NewHardwareModel.findById(id);
      if (!hardware) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.HARDWARE_NOT_FOUND);
      }
      return hardware;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NewHardwareService', method: 'getById', id });
    }
  }

  /**
   * Update hardware by ID
   * @param id - Hardware ID
   * @param data - Update data
   * @returns Updated hardware
   */
  static async update(id: string, data: Partial<NewHardware>) {
    try {
      const updated = await NewHardwareModel.findByIdAndUpdate(id, data, { new: true });
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.HARDWARE_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NewHardwareService', method: 'update', id, data });
    }
  }

  /**
   * Delete hardware by ID
   * @param id - Hardware ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await NewHardwareModel.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.HARDWARE_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NewHardwareService', method: 'delete', id });
    }
  }
}


