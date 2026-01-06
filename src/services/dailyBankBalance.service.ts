import BankBalance from "../models/dailyBankBalance.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { CurrencyConverter } from "../utils/currency-converter.util";
import {
    BankBalanceQuery,
    CreateBankBalanceData,
    UpdateBankBalanceData,
} from "../interfaces/model.interface";

export class BankBalanceService {
    /**
     * Create a new bank balance entry
     */
    static async create(data: CreateBankBalanceData): Promise<any> {
        try {
            const bankBalance = await BankBalance.create(data);
            return bankBalance.toObject();
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'BankBalanceService',
                method: 'create',
                data,
            });
        }
    }

    /**
     * Get all bank balance entries with pagination and filtering
     */
    static async getAll(query: BankBalanceQuery): Promise<any> {
        try {
            const searchableFields = ['account', 'bank', 'branch'];
            const allowedSortFields = [
                'account',
                'bank',
                'type',
                'currentBalance',
                'finalBalance',
                'status',
                'createdAt',
                'updatedAt',
            ];
            const filterFields = ['bank', 'type', 'status', 'currency'];

            const result = await PaginationService.paginate(
                BankBalance,
                query,
                {
                    searchFields: searchableFields,
                    allowedSortFields: allowedSortFields,
                    filterFields: filterFields,
                }
            );

            const bankBalancesWithConversions = await Promise.all(
                result.data.map((item: any) => CurrencyConverter.formatWithDisplayCurrency(item))
            );

            return {
                bankBalances: bankBalancesWithConversions,
                pagination: result.pagination,
                filters: result.filters,
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'BankBalanceService',
                method: 'getAll',
                query,
            });
        }
    }

    /**
     * Get bank balance by ID
     */
    static async getById(id: string): Promise<any> {
        try {
            const bankBalance = await BankBalance.findById(id).lean();

            if (!bankBalance) {
                throw throwError(
                    ERROR_MESSAGES.CLIENT_ERRORS.BANK_BALANCE_NOT_FOUND
                );
            }

            return await CurrencyConverter.formatWithDisplayCurrency(bankBalance);
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'BankBalanceService',
                method: 'getById',
                id,
            });
        }
    }

    /**
     * Update bank balance by ID
     */
    static async update(
        id: string,
        data: UpdateBankBalanceData
    ): Promise<any> {
        try {
            const existing = await BankBalance.findById(id);

            if (!existing) {
                throw throwError(
                    ERROR_MESSAGES.CLIENT_ERRORS.BANK_BALANCE_NOT_FOUND
                );
            }

            const updated = await BankBalance.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).lean();

            if (!updated) {
                throw throwError(
                    ERROR_MESSAGES.CLIENT_ERRORS.BANK_BALANCE_NOT_FOUND
                );
            }

            return await CurrencyConverter.formatWithDisplayCurrency(updated);
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'BankBalanceService',
                method: 'update',
                id,
                data,
            });
        }
    }

    /**
     * Delete bank balance by ID
     */
    static async delete(id: string): Promise<void> {
        try {
            const deleted = await BankBalance.findByIdAndDelete(id);

            if (!deleted) {
                throw throwError(
                    ERROR_MESSAGES.CLIENT_ERRORS.BANK_BALANCE_NOT_FOUND
                );
            }
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'BankBalanceService',
                method: 'delete',
                id,
            });
        }
    }

    /**
     * Bulk update bank balances (for Excel view)
     */
    static async bulkUpdate(updates: Array<{ id: string; data: UpdateBankBalanceData }>): Promise<any> {
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
                serviceName: 'BankBalanceService',
                method: 'bulkUpdate',
                updates,
            });
        }
    }

    /**
     * Get summary/totals for all bank balances
     */
    static async getSummary(query: BankBalanceQuery, baseCurrency: string = 'KWD'): Promise<any> {
        try {
            const filters: any = {};

            if (query.type) filters.type = query.type;
            if (query.status) filters.status = query.status;
            if (query.bank) filters.bank = query.bank;
            if (query.currency) filters.currency = query.currency;

            const [bankBalances, activeCount] = await Promise.all([
                BankBalance.find(filters).lean(),
                BankBalance.countDocuments({ ...filters, status: 'Active' }),
            ]);

            let totalCurrentBalanceInBase = 0;
            let totalFinalBalanceInBase = 0;

            for (const balance of bankBalances) {
                totalCurrentBalanceInBase += await CurrencyConverter.convertCurrencyWithFallback(
                    balance.currentBalance || 0,
                    balance.currency || baseCurrency,
                    baseCurrency
                );

                if (balance.finalBalance !== undefined && balance.finalBalance !== null) {
                    totalFinalBalanceInBase += await CurrencyConverter.convertCurrencyWithFallback(
                        balance.finalBalance,
                        balance.currency || baseCurrency,
                        baseCurrency
                    );
                }
            }

            return {
                totalBalanceAcrossAllAccounts: totalCurrentBalanceInBase,
                totalAccounts: bankBalances.length,
                totalFinalBalanceInBase,
                baseCurrency: baseCurrency,
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'BankBalanceService',
                method: 'getSummary',
                query,
            });
        }
    }
}
