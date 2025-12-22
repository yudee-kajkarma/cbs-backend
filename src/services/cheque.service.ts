import Cheque from "../models/cheque.model";
import BankAccount from "../models/bankAccount.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { 
  ChequeQuery, 
  CreateChequeData, 
  UpdateChequeData 
} from "../interfaces/model.interface";

export class ChequeService {
  /**
   * Helper: Format cheque for response
   */
  private static formatCheque(cheque: any) {
    return cheque;
  }

  /**
   * Create a new cheque
   */
  static async create(data: CreateChequeData): Promise<any> {
    try {
      const bankAccount = await BankAccount.findById(data.bankAccount);
      if (!bankAccount) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      const chequeNumber = await ReferenceGenerator.generateChequeReference();

      const cheque = await Cheque.create({ ...data, chequeNumber });
      const populated = await Cheque.findById(cheque._id)
        .populate('bankAccount', 'bankName branch accountNumber currentChequeNumber currency')
        .lean();

      return this.formatCheque(populated);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ChequeService', method: 'create', data });
    }
  }

  /**
   * Get all cheques with pagination and filtering
   */
  static async getAll(query: ChequeQuery): Promise<any> {
    try {
      const searchableFields = ['chequeNumber', 'payeeName'];
      const allowedSortFields = ['chequeNumber', 'payeeName', 'amount', 'chequeDate', 'printStatus', 'transactionStatus', 'createdAt', 'updatedAt'];
      const filterFields = ['printStatus', 'transactionStatus', 'bankAccount'];

      const result = await PaginationService.paginate(Cheque, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
        populateOptions: [
          {
            path: 'bankAccount',
            select: 'bankName branch accountNumber currentChequeNumber currency',
          },
        ],
      });

      return {
        cheques: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ChequeService', method: 'getAll', query });
    }
  }

  /**
   * Get cheque by ID
   */
  static async getOne(id: string): Promise<any> {
    try {
      const cheque = await Cheque.findById(id)
        .populate('bankAccount', 'bankName branch accountNumber currentChequeNumber currency')
        .lean();
      
      if (!cheque) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.CHEQUE_NOT_FOUND);
      }

      return this.formatCheque(cheque);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ChequeService', method: 'getOne', id });
    }
  }

  /**
   * Update cheque by ID (only status fields)
   */
  static async update(id: string, data: UpdateChequeData): Promise<any> {
    try {
      const updated = await Cheque.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      )
        .populate('bankAccount', 'bankName branch accountNumber currentChequeNumber currency')
        .lean();

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.CHEQUE_NOT_FOUND);
      }

      return this.formatCheque(updated);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ChequeService', method: 'update', id, data });
    }
  }

  /**
   * Delete cheque by ID
   */
  static async remove(id: string): Promise<void> {
    try {
      const deleted = await Cheque.findByIdAndDelete(id);
      
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.CHEQUE_NOT_FOUND);
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ChequeService', method: 'remove', id });
    }
  }
}
