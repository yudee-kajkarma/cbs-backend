import { Sim } from "../models";
import { SimQuery, CreateSimData, ISim } from "../interfaces/model.interface";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants";

/**
 * SimService
 * @description Service for SIM operations
 */
export class SimService {
  /**
   * Create a new SIM
   * @param data - SIM data
   * @returns Created SIM
   */
  static async create(data: CreateSimData) {
    try {
      return await Sim.create(data);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SimService', method: 'create', data });
    }
  }

  /**
   * Get all SIMs with pagination
   * @param query - Query parameters
   * @returns Paginated SIM list
   */
  static async getAll(query: SimQuery) {
    try {
      const searchableFields = ['simNumber', 'carrier', 'assignedTo'];
      const allowedSortFields = ['simNumber', 'carrier', 'assignedTo', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['carrier', 'status'];

      const result = await PaginationService.paginate(Sim, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        sims: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SimService', method: 'getAll', query });
    }
  }

  /**
   * Get SIM by ID
   * @param id - SIM ID
   * @returns SIM details
   */
  static async getById(id: string) {
    try {
      const sim = await Sim.findById(id);
      if (!sim) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SIM_NOT_FOUND);
      }
      return sim;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SimService', method: 'getById', id });
    }
  }

  /**
   * Update SIM by ID
   * @param id - SIM ID
   * @param data - Update data
   * @returns Updated SIM
   */
  static async update(id: string, data: Partial<ISim>) {
    try {
      const updated = await Sim.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SIM_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SimService', method: 'update', id, data });
    }
  }

  /**
   * Delete SIM by ID
   * @param id - SIM ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await Sim.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SIM_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SimService', method: 'delete', id });
    }
  }

  /**
   * Get SIM statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await Sim.countDocuments();
      const active = await Sim.countDocuments({ status: 'Active' });
      const inactive = await Sim.countDocuments({ status: { $ne: 'Active' } });

      return { total, active, inactive };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SimService', method: 'getStats' });
    }
  }
}