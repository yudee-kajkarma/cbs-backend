import { NetworkEquipment } from "../models";
import { INetworkEquipment, NetworkEquipmentQuery, CreateNetworkEquipmentData, UpdateNetworkEquipmentData } from "../interfaces";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants";

/**
 * NetworkEquipmentService
 * @description Service for network equipment operations
 */
export class NetworkEquipmentService {
  /**
   * Create a new network equipment
   * @param data - Network equipment data
   * @returns Created network equipment
   */
  static async create(data: CreateNetworkEquipmentData) {
    try {
      return await NetworkEquipment.create(data);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'create', data });
    }
  }

  /**
   * Get all network equipment with pagination
   * @param query - Query parameters
   * @returns Paginated network equipment list
   */
  static async getAll(query: NetworkEquipmentQuery) {
    try {
      const searchableFields = ['equipmentName', 'serialNumber', 'macAddress', 'ipAddress', 'location'];
      const allowedSortFields = ['equipmentName', 'equipmentType', 'serialNumber', 'macAddress', 'ipAddress', 'location', 'status', 'purchaseDate', 'warrantyExpiry', 'firmwareVersion', 'numberOfPorts', 'createdAt', 'updatedAt'];
      const filterFields = ['equipmentType', 'status', 'location', 'createdAt', 'updatedAt'];

      const result = await PaginationService.paginate(NetworkEquipment, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        networkEquipments: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'getAll', query });
    }
  }

  /**
   * Get network equipment by ID
   * @param id - Network equipment ID
   * @returns Network equipment details
   */
  static async getById(id: string) {
    try {
      const equipment = await NetworkEquipment.findById(id);
      if (!equipment) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.NETWORK_EQUIPMENT_NOT_FOUND);
      }
      return equipment;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'getById', id });
    }
  }

  /**
   * Update network equipment by ID
   * @param id - Network equipment ID
   * @param data - Update data
   * @returns Updated network equipment
   */
  static async update(id: string, data: Partial<INetworkEquipment>) {
    try {
      const updated = await NetworkEquipment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.NETWORK_EQUIPMENT_NOT_FOUND);
      }
      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'update', id, data });
    }
  }

  /**
   * Delete network equipment by ID
   * @param id - Network equipment ID
   * @returns Success boolean
   */
  static async delete(id: string) {
    try {
      const deleted = await NetworkEquipment.findByIdAndDelete(id);
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.NETWORK_EQUIPMENT_NOT_FOUND);
      }
      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'delete', id });
    }
  }

  /**
   * Find network equipment by serial number
   * @param serial - Serial number
   * @returns Network equipment if found
   */
  static async findBySerial(serial: string) {
    try {
      return await NetworkEquipment.findOne({ serialNumber: serial });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'findBySerial', serial });
    }
  }

  /**
   * Find network equipment by MAC address
   * @param mac - MAC address
   * @returns Network equipment if found
   */
  static async findByMac(mac: string) {
    try {
      return await NetworkEquipment.findOne({ macAddress: mac });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'findByMac', mac });
    }
  }

  /**
   * Find network equipment by MAC address excluding specific ID
   * @param mac - MAC address
   * @param id - ID to exclude
   * @returns Network equipment if found
   */
  static async findByMacExcludeId(mac: string, id: string) {
    try {
      return await NetworkEquipment.findOne({ macAddress: mac, _id: { $ne: id } });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'findByMacExcludeId', mac, id });
    }
  }

  /**
   * Find network equipment by serial number excluding specific ID
   * @param serial - Serial number
   * @param id - ID to exclude
   * @returns Network equipment if found
   */
  static async findBySerialExcludeId(serial: string, id: string) {
    try {
      return await NetworkEquipment.findOne({ serialNumber: serial, _id: { $ne: id } });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'findBySerialExcludeId', serial, id });
    }
  }

  /**
   * Get network equipment statistics for analytics
   * @returns Statistics object with counts
   */
  static async getStats() {
    try {
      const total = await NetworkEquipment.countDocuments();
      const online = await NetworkEquipment.countDocuments({ status: 'Online' });
      const offline = await NetworkEquipment.countDocuments({ status: 'Offline' });
      const maintenance = await NetworkEquipment.countDocuments({ status: 'Maintenance' });

      return { total, online, offline, maintenance };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'NetworkEquipmentService', method: 'getStats' });
    }
  }
}

