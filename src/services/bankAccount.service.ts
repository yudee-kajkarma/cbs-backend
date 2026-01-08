import BankAccount from "../models/bankAccount.model";
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  BankAccountDocument,
  BankAccountQuery, 
  CreateBankAccountData, 
  UpdateBankAccountData 
} from "../interfaces/model.interface";

export class BankAccountService {
  /**
   * Helper: Format bank account for list view (without S3 calls)
   */
  private static formatBankAccountForList(account: BankAccountDocument) {
    return {
      ...account,
      hasTemplate: !!account.fileKey,
    };
  }

  /**
   * Helper: Format bank account with S3 URL
   */
  private static async formatBankAccount(account: BankAccountDocument) {
    return {
      ...account,
      fileUrl: account.fileKey
        ? await FileUploadService.generateDownloadUrl(account.fileKey)
        : null,
    };
  }

  /**
   * Create a new bank account
   */
  static async create(data: CreateBankAccountData): Promise<BankAccountDocument> {
    try {
      if (data.fileKey) {
        await validateS3Keys([data.fileKey]);
      }

      const account = await BankAccount.create(data);
      return account.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'BankAccountService', method: 'create', data });
    }
  }

  /**
   * Get all bank accounts with pagination and filtering
   */
  static async getAll(query: BankAccountQuery): Promise<any> {
    try {
      const searchableFields = ['bankName', 'branch', 'accountHolder', 'accountNumber'];
      const allowedSortFields = ['bankName', 'accountHolder', 'accountNumber', 'currency', 'createdAt', 'updatedAt'];
      const filterFields = ['currency', 'bankName'];

      const result = await PaginationService.paginate(BankAccount, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Format bank accounts with S3 URLs
      const formatted = await Promise.all(
        result.data.map((account) => this.formatBankAccount(account as BankAccountDocument))
      );

      return {
        bankAccounts: formatted,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'BankAccountService', method: 'getAll', query });
    }
  }

  /**
   * Get bank account by ID
   */
  static async getOne(id: string): Promise<any> {
    try {
      const account = await BankAccount.findById(id).lean();
      
      if (!account) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      return await this.formatBankAccount(account as unknown as BankAccountDocument);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'BankAccountService', method: 'getOne', id });
    }
  }

  /**
   * Update bank account by ID
   */
  static async update(id: string, data: UpdateBankAccountData): Promise<any> {
    try {
      const existing = await BankAccount.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      if (data.fileKey && data.fileKey !== existing.fileKey) {
        await validateS3Keys([data.fileKey]);
        
        // Delete old file if it exists
        if (existing.fileKey) {
          await FileUploadService.deleteFiles([existing.fileKey]);
        }
      }

      const updated = await BankAccount.findByIdAndUpdate(
        id,
        data,
        { new: true, lean: true }
      );

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      return await this.formatBankAccount(updated as unknown as BankAccountDocument);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'BankAccountService', method: 'update', id, data });
    }
  }

  /**
   * Delete bank account by ID
   */
  static async remove(id: string): Promise<void> {
    try {
      const existing = await BankAccount.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      const fileKey = existing.fileKey;
      
      await BankAccount.findByIdAndDelete(id);
      
      if (fileKey) {
        try {
          await FileUploadService.deleteFiles([fileKey]);
        } catch (error) {
          console.error('Failed to delete S3 file:', fileKey, error);
        }
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'BankAccountService', method: 'remove', id });
    }
  }
}
