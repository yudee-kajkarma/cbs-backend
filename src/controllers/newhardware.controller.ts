import { Request, Response } from "express";
import { NewHardwareService } from "../services/newhardware.service";
import { NewHardwareResponseDto, GetAllNewHardwareResponseDto } from "../dtos/newhardware-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class NewHardwareController {
  /**
   * Create a new hardware
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await NewHardwareService.create(req.body);
      const dto = toDto(NewHardwareResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.NEW_HARDWARE.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all hardware with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await NewHardwareService.getAll(req.query);
      const hardwareDto = toDtoList(NewHardwareResponseDto, result.newHardwares);
      const responseData = {
        newHardwares: hardwareDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.NEW_HARDWARE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get hardware by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await NewHardwareService.getById(id);
      const dto = toDto(NewHardwareResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.NEW_HARDWARE.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update hardware by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await NewHardwareService.update(id, req.body);
      const dto = toDto(NewHardwareResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.NEW_HARDWARE.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete hardware by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await NewHardwareService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.NEW_HARDWARE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
