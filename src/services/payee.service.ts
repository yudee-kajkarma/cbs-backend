import Payee from "../models/payee.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  PayeeDocument, 
  PayeeQuery, 
  CreatePayeeData, 
  UpdatePayeeData 
} from "../interfaces/model.interface";

export class PayeeService {
  
  /**
   * Create a new payee
   */
  static async create(data: CreatePayeeData): Promise<PayeeDocument> {
    try {
      const payee = await Payee.create(data);
      return payee.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayeeService', method: 'create', data });
    }
  }

  /**
   * Get payee by ID
   */
  static async getById(id: string): Promise<PayeeDocument> {
    try {
      const payee = await Payee.findById(id).lean();

      if (!payee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYEE_NOT_FOUND);
      }

      return payee as PayeeDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayeeService', method: 'getById', id });
    }
  }

  /**
   * Get all payees with pagination and filtering
   */
  static async getAll(query: PayeeQuery): Promise<any> {
    try {
      const searchableFields = ['name', 'company', 'category', 'email', 'phone'];
      const allowedSortFields = ['name', 'company', 'category', 'email', 'createdAt', 'updatedAt'];
      const filterFields = ['category'];

      const result = await PaginationService.paginate(Payee, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        payees: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayeeService', method: 'getAll', query });
    }
  }

  /**
   * Update a payee
   */
  static async update(id: string, data: UpdatePayeeData): Promise<PayeeDocument> {
    try {
      const payee = await Payee.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!payee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYEE_NOT_FOUND);
      }

      return payee as PayeeDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayeeService', method: 'update', id, data });
    }
  }

  /**
   * Delete a payee
   */
  static async delete(id: string): Promise<void> {
    try {
      const payee = await Payee.findByIdAndDelete(id);

      if (!payee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYEE_NOT_FOUND);
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayeeService', method: 'delete', id });
    }
  }
}
