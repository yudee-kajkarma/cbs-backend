import { Request, Response } from "express";
import { HardwareTransferService } from "../services/hardwareTransfer.service";
import { HardwareTransferResponseDto, GetAllHardwareTransfersResponseDto } from "../dtos/hardwareTransfer-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class HardwareTransferController {
  /**
   * Create a new hardware transfer
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await HardwareTransferService.create(req.body);
      const dto = toDto(HardwareTransferResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.HARDWARE_TRANSFER.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all hardware transfers with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await HardwareTransferService.getAll(req.query);
      const transfersDto = toDtoList(HardwareTransferResponseDto, result.hardwareTransfers);
      const responseData = {
        hardwareTransfers: transfersDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.HARDWARE_TRANSFER.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get hardware transfer by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await HardwareTransferService.getById(id);
      const dto = toDto(HardwareTransferResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.HARDWARE_TRANSFER.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update hardware transfer by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await HardwareTransferService.update(id, req.body);
      const dto = toDto(HardwareTransferResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.HARDWARE_TRANSFER.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete hardware transfer by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await HardwareTransferService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.HARDWARE_TRANSFER.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
