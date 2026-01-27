import { BankAccount } from "../models";
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { CurrencyConverter } from "../utils/currency-converter.util";
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
   * Helper: Format bank account with currency conversion
   */
  private static async formatWithDisplayCurrency(account: any) {
    if (account.currentBalance !== undefined && account.displayCurrency) {
      return await CurrencyConverter.formatWithDisplayCurrency(account);
    }
    return account;
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
      const allowedSortFields = ['bankName', 'accountHolder', 'accountNumber', 'currency', 'type', 'currentBalance', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['currency', 'bankName', 'type', 'status'];

      const result = await PaginationService.paginate(BankAccount, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      const formatted = await Promise.all(
        result.data.map(async (account) => {
          const withS3 = await this.formatBankAccount(account as BankAccountDocument);
          return await this.formatWithDisplayCurrency(withS3);
        })
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

      const formatted = await this.formatBankAccount(account as unknown as BankAccountDocument);
      return await this.formatWithDisplayCurrency(formatted);
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
        { new: true, lean: true, runValidators: true }
      );

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      const formatted = await this.formatBankAccount(updated as unknown as BankAccountDocument);
      return await this.formatWithDisplayCurrency(formatted);
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

  /**
   * Bulk update bank accounts (for Excel view)
   */
  static async bulkUpdate(updates: Array<{ id: string; data: UpdateBankAccountData }>): Promise<any> {
    try {
      const results = await Promise.all(
        updates.map(async ({ id, data }) => {
          try {
            return await this.update(id, data);
          } catch (error) {
            return { id, error: error instanceof Error ? error.message : 'Update failed' };
          }
        })
      );

      const successful = results.filter(r => !('error' in r));
      const failed = results.filter(r => 'error' in r);

      return {
        updated: successful.length,
        failed: failed.length,
        errors: failed,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: 'BankAccountService',
        method: 'bulkUpdate',
        updates,
      });
    }
  }

  /**
   * Get summary/totals for all bank accounts with balance tracking
   */
  static async getSummary(query: BankAccountQuery, baseCurrency: string = 'KWD'): Promise<any> {
    try {
      const filters: any = {};

      if (query.type) filters.type = query.type;
      if (query.status) filters.status = query.status;
      if (query.bankName) filters.bankName = query.bankName;
      if (query.currency) filters.currency = query.currency;

      const [bankAccounts, activeCount] = await Promise.all([
        BankAccount.find(filters).lean(),
        BankAccount.countDocuments({ ...filters, status: 'Active' }),
      ]);

      let totalCurrentBalanceInBase = 0;

      for (const account of bankAccounts) {
        if (account.currentBalance !== undefined && account.currentBalance !== null) {
          totalCurrentBalanceInBase += await CurrencyConverter.convertCurrencyWithFallback(
            account.currentBalance,
            account.currency || baseCurrency,
            baseCurrency
          );
        }
      }

      return {
        totalBalanceAcrossAllAccounts: totalCurrentBalanceInBase,
        totalAccounts: bankAccounts.length,
        baseCurrency: baseCurrency,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: 'BankAccountService',
        method: 'getSummary',
        query,
      });
    }
  }

  /**
   * Get bank account statistics for analytics
   */
  static async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    try {
      const [total, active, inactive] = await Promise.all([
        BankAccount.countDocuments(),
        BankAccount.countDocuments({ status: 'Active' }),
        BankAccount.countDocuments({ status: 'Inactive' })
      ]);

      return { total, active, inactive };
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: 'BankAccountService',
        method: 'getStats'
      });
    }
  }
}
