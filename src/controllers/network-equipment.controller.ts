import { Request, Response } from "express";
import { NetworkEquipmentService } from "../services/network-equipment.service";
import { NetworkEquipmentResponseDto, GetAllNetworkEquipmentResponseDto } from "../dtos/network-equipment-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class NetworkEquipmentController {
  /**
   * Create a new network equipment
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await NetworkEquipmentService.create(req.body);
      const dto = toDto(NetworkEquipmentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.NETWORK_EQUIPMENT.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all network equipment with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await NetworkEquipmentService.getAll(req.query);
      const equipmentDto = toDtoList(NetworkEquipmentResponseDto, result.networkEquipments);
      const responseData = {
        networkEquipments: equipmentDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.NETWORK_EQUIPMENT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get network equipment by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await NetworkEquipmentService.getById(id);
      const dto = toDto(NetworkEquipmentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.NETWORK_EQUIPMENT.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update network equipment by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await NetworkEquipmentService.update(id, req.body);
      const dto = toDto(NetworkEquipmentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.NETWORK_EQUIPMENT.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete network equipment by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await NetworkEquipmentService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.NETWORK_EQUIPMENT.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
