import { Request, Response } from "express";
import { ISOService } from "../services/iso.service";
import { ISOResponseDto, GetAllISOResponseDto } from "../dtos/iso-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class ISOController {
  /**
   * Create a new ISO record
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await ISOService.create(req.body);
      const dto = toDto(ISOResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ISO.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all ISO records with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await ISOService.getAll(req.query);
      const isoDto = toDtoList(ISOResponseDto, result.isos);
      const responseData = {
        isos: isoDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.ISO.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get ISO record by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ISOService.getOne(id);
      const dto = toDto(ISOResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ISO.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update ISO record by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ISOService.update(id, req.body);
      const dto = toDto(ISOResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ISO.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete ISO record by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ISOService.remove(id);
      const response = ResponseUtil.success(INFO_MESSAGES.ISO.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
