import  HardwareTransferModel  from "../models/hardwareTransfer.model";
import { IHardwareTransfer } from "../interfaces";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants";
import { calculateTransferStatus } from "../utils/status.util";

/**
 * HardwareTransferService
 * @description Service for hardware transfer operations
 */
export class HardwareTransferService {
  /**
   * Create a new hardware transfer
   * @param data - Hardware transfer data
   * @returns Created hardware transfer
   */
  static async create(data: Partial<IHardwareTransfer>) {
    try {
      const status = calculateTransferStatus(
        data.transferDate!,
        data.expectedReturnDate || null,
        data.transferType!
      );
      return await HardwareTransferModel.create({ ...data, status });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'HardwareTransferService', method: 'create', data });
    }
  }

  /**
   * Get all hardware transfers with pagination
   * @param query - Query parameters
   * @returns Paginated hardware transfer list
   */
  static async getAll(query: any) {
    try {
      const searchableFields = ['serialNumber', 'hardwareName', 'transferReason'];
      const allowedSortFields = ['hardwareName', 'fromUser', 'toUser', 'transferType', 'transferDate', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['hardwareName', 'fromUser', 'toUser', 'transferType', 'hardwareCondition', 'status'];

      const result = await PaginationService.paginate(HardwareTransferModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        hardwareTransfers: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'HardwareTransferService', method: 'getAll', query });
    }
  }

  /**
   * Get hardware transfer by ID
   * @param id - Hardware transfer ID
   * @returns Hardware transfer details
   */
  static async getById(id: string) {
    try {
      const hardwareTransfer = await HardwareTransferModel.findById(id);
      if (!hardwareTransfer) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.HARDWARE_TRANSFER_NOT_FOUND);
      }
      return hardwareTransfer;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'HardwareTransferService', method: 'getById', id });
    }
  }

  /**
   * Update hardware transfer by ID
   * @param id - Hardware transfer ID
   * @param data - Update data
   * @returns Updated hardware transfer
   */
  static async update(id: string, data: Partial<IHardwareTransfer>) {
    try {
      const status = calculateTransferStatus(
        data.transferDate!,
        data.expectedReturnDate || null,
        data.transferType!
      );
      const updated = await HardwareTransferModel.findByIdAndUpdate(
        id,
        { ...data, status },
        { new: true, runValidators: true }
      );
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.HARDWARE_TRANSFER_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'HardwareTransferService', method: 'update', id, data });
    }
  }

  /**
   * Delete hardware transfer by ID
   * @param id - Hardware transfer ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await HardwareTransferModel.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.HARDWARE_TRANSFER_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'HardwareTransferService', method: 'delete', id });
    }
  }
}

