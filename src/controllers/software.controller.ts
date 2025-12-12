import { Request, Response } from "express";
import { SoftwareService } from "../services/software.service";
import { SoftwareResponseDto, GetAllSoftwareResponseDto } from "../dtos/software-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class SoftwareController {
  /**
   * Create a new software
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await SoftwareService.create(req.body);
      const dto = toDto(SoftwareResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SOFTWARE.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all software with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await SoftwareService.getAll(req.query);
      const softwareDto = toDtoList(SoftwareResponseDto, result.softwares);
      const responseData = {
        softwares: softwareDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.SOFTWARE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get software by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SoftwareService.getById(id);
      const dto = toDto(SoftwareResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SOFTWARE.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update software by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SoftwareService.update(id, req.body);
      const dto = toDto(SoftwareResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SOFTWARE.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete software by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await SoftwareService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.SOFTWARE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
