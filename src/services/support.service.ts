import  SupportModel from "../models/support.model";
import { SupportQuery, CreateSupportData, ISupport } from "../interfaces/model.interface";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants";

/**
 * SupportService
 * @description Service for support ticket operations
 */
export class SupportService {
  /**
   * Create a new support ticket
   * @param data - Support ticket data
   * @returns Created support ticket
   */
  static async create(data: CreateSupportData) {
    try {
      return await SupportModel.create(data);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SupportService', method: 'create', data });
    }
  }

  /**
   * Get all support tickets with pagination
   * @param query - Query parameters
   * @returns Paginated support ticket list
   */
  static async getAll(query: SupportQuery) {
    try {
      const searchableFields = ['ticketTitle', 'description'];
      const allowedSortFields = ['ticketTitle', 'category', 'priority', 'department', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['category', 'priority', 'department', 'status'];

      const result = await PaginationService.paginate(SupportModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        tickets: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SupportService', method: 'getAll', query });
    }
  }

  /**
   * Get support ticket by ID
   * @param id - Support ticket ID
   * @returns Support ticket details
   */
  static async getById(id: string) {
    try {
      const support = await SupportModel.findById(id);
      if (!support) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SUPPORT_NOT_FOUND);
      }
      return support;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SupportService', method: 'getById', id });
    }
  }

  /**
   * Update support ticket by ID
   * @param id - Support ticket ID
   * @param data - Update data
   * @returns Updated support ticket
   */
  static async update(id: string, data: Partial<ISupport>) {
    try {
      const updated = await SupportModel.findByIdAndUpdate(id, data, { new: true });
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SUPPORT_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SupportService', method: 'update', id, data });
    }
  }

  /**
   * Delete support ticket by ID
   * @param id - Support ticket ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await SupportModel.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SUPPORT_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SupportService', method: 'delete', id });
    }
  }

  /**
   * Get support statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await SupportModel.countDocuments();
      const open = await SupportModel.countDocuments({ status: 'Open' });
      const inProgress = await SupportModel.countDocuments({ status: 'In Progress' });
      const resolved = await SupportModel.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });

      return { total, open, inProgress, resolved };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'SupportService', method: 'getStats' });
    }
  }
}