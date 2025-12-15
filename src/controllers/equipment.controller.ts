import { Request, Response } from "express";
import { EquipmentService } from "../services/equipment.service";
import { EquipmentResponseDto, GetAllEquipmentResponseDto } from "../dtos/equipment-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class EquipmentController {
  /**
   * Create new equipment
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await EquipmentService.create(req.body);
      const equipmentDto = toDto(EquipmentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.EQUIPMENT.CREATED_SUCCESSFULLY, equipmentDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get equipment by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await EquipmentService.getById(id);
      const equipmentDto = toDto(EquipmentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.EQUIPMENT.RETRIEVED_SUCCESSFULLY, equipmentDto);
      res.json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all equipment with pagination
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await EquipmentService.getAll(query);

      const equipmentDto = toDtoList(EquipmentResponseDto, result.equipment);

      const responseData: GetAllEquipmentResponseDto = {
        equipment: equipmentDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.EQUIPMENT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update equipment by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await EquipmentService.update(id, req.body);
      const equipmentDto = toDto(EquipmentResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.EQUIPMENT.UPDATED_SUCCESSFULLY, equipmentDto);
      res.json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete equipment by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await EquipmentService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.EQUIPMENT.DELETED_SUCCESSFULLY, null);
      res.json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
