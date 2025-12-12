import { Request, Response } from "express";
import { FurnitureService } from "../services/furniture.service";
import { ErrorHandler } from '../utils/error-handler.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { toDto, toDtoList } from '../utils/dto-mapper.util';
import { FurnitureResponseDto, GetAllFurnitureResponseDto } from '../dtos/furniture-dto';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class FurnitureController {
  /**
   * Create a new furniture record
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await FurnitureService.create(req.body);
      const dto = toDto(FurnitureResponseDto, data);
      const response = ResponseUtil.success(INFO_MESSAGES.FURNITURE.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all furniture with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await FurnitureService.getAll(req.query);
      const furnitureDto = toDtoList(FurnitureResponseDto, result.furnitures);
      const responseData = {
        furnitures: furnitureDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.FURNITURE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get furniture by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await FurnitureService.getById(id);
      const dto = toDto(FurnitureResponseDto, data);
      const response = ResponseUtil.success(INFO_MESSAGES.FURNITURE.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update furniture by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await FurnitureService.update(id, req.body);
      const dto = toDto(FurnitureResponseDto, data);
      const response = ResponseUtil.success(INFO_MESSAGES.FURNITURE.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete furniture by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await FurnitureService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.FURNITURE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
