import { TelexTransfer, BankAccount } from "../models";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { TelexTransferDocument } from "../models/telexTransfer.model";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import {
    TelexTransferQuery,
    CreateTelexTransferData,
    UpdateTelexTransferData
} from "../interfaces/model.interface";

export class TelexTransferService {

    /**
     * Create a new telex transfer
     */
    static async create(data: CreateTelexTransferData): Promise<TelexTransferDocument> {
        try {
            const senderBank = await BankAccount.findById(data.senderBank);
            if (!senderBank) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
            }

            const referenceNo = await ReferenceGenerator.generateTelexTransferReference();

            const telexTransfer = await TelexTransfer.create({
                ...data,
                referenceNo,
                ...data,
                transferDate: data.transferDate ? new Date(data.transferDate) : undefined,
            });

            const populated = await TelexTransfer.findById(telexTransfer._id)
                .populate('senderBank', 'bankName accountNumber accountHolder')
                .lean();

            return populated as TelexTransferDocument;
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'TelexTransferService', method: 'create', data });
        }
    }

    /**
     * Get telex transfer by ID
     */
    static async getById(id: string): Promise<any> {
        try {
            const telexTransfer = await TelexTransfer.findById(id)
                .populate('senderBank', 'bankName accountNumber accountHolder')
                .lean();

            if (!telexTransfer) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TELEX_TRANSFER_NOT_FOUND);
            }

            return telexTransfer;
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'TelexTransferService', method: 'getById', id });
        }
    }

    /**
     * Get all telex transfers with pagination and filtering
     */
    static async getAll(query: TelexTransferQuery): Promise<any> {
        try {
            const searchableFields = ['referenceNo', 'beneficiaryName', 'beneficiaryBankName', 'purpose', 'authorizedBy'];
            const allowedSortFields = ['referenceNo', 'transferDate', 'beneficiaryName', 'transferAmount', 'status', 'createdAt', 'updatedAt'];
            const filterFields = ['status', 'currency'];

            const result = await PaginationService.paginate(TelexTransfer, query, {
                searchFields: searchableFields,
                allowedSortFields: allowedSortFields,
                filterFields: filterFields,
                populateOptions: [
                    { path: 'senderBank', select: 'bankName accountNumber accountHolder' }
                ]
            });

            return {
                telexTransfers: result.data,
                pagination: result.pagination,
                filters: result.filters,
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'TelexTransferService', method: 'getAll', query });
        }
    }

    /**
     * Update telex transfer by ID
     */
    static async update(
        id: string,
        data: UpdateTelexTransferData
    ): Promise<any> {
        try {
            const existing = await TelexTransfer.findById(id);

            if (!existing) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TELEX_TRANSFER_NOT_FOUND);
            }

            // Validate sender bank exists if being updated
            if (data.senderBank) {
                const senderBank = await BankAccount.findById(data.senderBank);
                if (!senderBank) {
                    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
                }
            }

            const updated = await TelexTransfer.findByIdAndUpdate(
                id,
                {
                    ...data,
                    transferDate: data.transferDate
                        ? new Date(data.transferDate)
                        : existing.transferDate,
                },
                { new: true, lean: true }
            )
                .populate('senderBank', 'bankName accountNumber accountHolder');

            return updated;
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'TelexTransferService', method: 'update', id, data });
        }
    }

    /**
     * Delete telex transfer by ID
     */
    static async delete(id: string): Promise<void> {
        try {
            const existing = await TelexTransfer.findById(id);

            if (!existing) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TELEX_TRANSFER_NOT_FOUND);
            }

            await TelexTransfer.findByIdAndDelete(id);
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'TelexTransferService', method: 'delete', id });
        }
    }

    /**
     * Approve/Reject telex transfer by admin
     */
    static async approve(
        id: string,
        data: { authorizedBy: string; status: string }
    ): Promise<any> {
        try {
            await this.getById(id);

            const updateData = {
                authorizedBy: data.authorizedBy,
                status: data.status,
            };

            const updated = await this.update(id, updateData);

            return updated;
        } catch (error) {
            ErrorHandler.handleServiceError(error, { serviceName: 'TelexTransferService', method: 'approve', id, data });
        }
    }

    /**
     * Get telex transfer statistics for analytics
     */
    static async getStats(): Promise<{ total: number; completed: number; pending: number; draft: number }> {
        try {
            const [total, completed, pending, draft] = await Promise.all([
                TelexTransfer.countDocuments(),
                TelexTransfer.countDocuments({ status: 'Completed' }),
                TelexTransfer.countDocuments({ status: 'Pending' }),
                TelexTransfer.countDocuments({ status: 'Draft' })
            ]);

            return { total, completed, pending, draft };
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'TelexTransferService',
                method: 'getStats'
            });
        }
    }
}
