import { EquipmentModel } from "../models/equipment.model";
import { Equipment, EquipmentDocument } from "../interfaces/model.interface";
import { PaginationService } from './pagination.service';
import { ERROR_MESSAGES } from "../constants";
import { ErrorHandler } from '../utils/error-handler.util';
import { throwError } from '../utils/errors.util';

export class EquipmentService {
  /**
   * Create a new equipment record
   */
  static async create(data: Partial<Equipment>) {
    try {
      const equipment = await EquipmentModel.create(data);
      return equipment.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EquipmentService', method: 'create', data });
    }
  }

  /**
   * Get all equipment with pagination, filtering, sorting, and search
   */
  static async getAll(query: any) {
    try {
      const searchableFields = [
        "equipmentName",
        "manufacturer",
        "equipmentModel",
        "serialNumber",
        "location",
      ];
      
      const allowedSortFields = [
        "equipmentName",
        "category",
        "manufacturer",
        "serialNumber",
        "condition",
        "location",
        "status",
        "purchaseDate",
        "warrantyExpiry",
        "lastMaintenanceDate",
        "nextMaintenanceDate",
        "createdAt",
        "updatedAt",
      ];

      const filterFields = ['category', 'condition', 'status', 'location', 'assignedTo'];

      const result = await PaginationService.paginate(EquipmentModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        equipment: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EquipmentService', method: 'getAll', query });
    }
  }

  /**
   * Get equipment by ID
   */
  static async getById(id: string) {
    try {
      const equipment = await EquipmentModel.findById(id).lean();

      if (!equipment) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EQUIPMENT_NOT_FOUND);
      }

      return equipment;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EquipmentService', method: 'getById', id });
    }
  }

  /**
   * Update equipment by ID
   */
  static async update(id: string, data: Partial<Equipment>) {
    try {
      const equipment = await EquipmentModel.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );

      if (!equipment) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EQUIPMENT_NOT_FOUND);
      }

      return equipment.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EquipmentService', method: 'update', id, data });
    }
  }

  /**
   * Delete equipment by ID
   */
  static async delete(id: string): Promise<void> {
    try {
      const equipment = await EquipmentModel.findByIdAndDelete(id);

      if (!equipment) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EQUIPMENT_NOT_FOUND);
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EquipmentService', method: 'delete', id });
    }
  }
}
