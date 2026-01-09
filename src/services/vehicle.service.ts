import  VehicleModel  from "../models/vehicle.model";
import { Vehicle, VehicleQuery } from "../interfaces";
import { PaginationService } from './pagination.service';
import { throwError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants';

/**
 * VehicleService
 * @description Service for vehicle operations
 */
export class VehicleService {
  /**
   * Create a new vehicle
   * @param data - Vehicle data
   * @returns Created vehicle
   */
  static async create(data: Partial<Vehicle>) {
    try {
      const vehicle = await VehicleModel.create(data);
      return vehicle.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'VehicleService', method: 'create', data });
    }
  }

  /**
   * Get all vehicles with pagination
   * @param query - Query parameters
   * @returns Paginated vehicle list
   */
  static async getAll(query: VehicleQuery) {
    try {
      const searchableFields = ['vehicleName', 'makeBrand', 'vehicleModel', 'plateNumber', 'chassisNumber'];
      const allowedSortFields = [
        'vehicleName',
        'makeBrand',
        'vehicleModel',
        'vehicleType',
        'year',
        'plateNumber',
        'status',
        'department',
        'mileage',
        'purchaseDate',
        'registrationExpiry',
        'insuranceExpiry',
        'lastService',
        'nextService',
        'createdAt',
        'updatedAt'
      ];
      const filterFields = ['vehicleType', 'fuelType', 'status', 'department', 'assignedTo'];

      const result = await PaginationService.paginate(VehicleModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        vehicles: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'VehicleService', method: 'getAll', query });
    }
  }

  /**
   * Get vehicle by ID
   * @param id - Vehicle ID
   * @returns Vehicle details
   */
  static async getById(id: string) {
    try {
      const vehicle = await VehicleModel.findById(id).lean();
      if (!vehicle) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.VEHICLE_NOT_FOUND);
      }
      return vehicle;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'VehicleService', method: 'getById', id });
    }
  }

  /**
   * Update vehicle by ID
   * @param id - Vehicle ID
   * @param data - Update data
   * @returns Updated vehicle
   */
  static async update(id: string, data: Partial<Vehicle>) {
    try {
      const updated = await VehicleModel.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.VEHICLE_NOT_FOUND);
      }
      return updated.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'VehicleService', method: 'update', id, data });
    }
  }

  /**
   * Delete vehicle by ID
   * @param id - Vehicle ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await VehicleModel.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.VEHICLE_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'VehicleService', method: 'delete', id });
    }
  }

  /**
   * Get vehicle statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await VehicleModel.countDocuments();
      const active = await VehicleModel.countDocuments({ status: 'Active' });
      const inactive = await VehicleModel.countDocuments({ status: { $ne: 'Active' } });

      return { total, active, inactive };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'VehicleService', method: 'getStats' });
    }
  }
}
