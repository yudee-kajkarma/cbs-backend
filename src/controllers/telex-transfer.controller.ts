import { Request, Response } from "express";
import { TelexTransferService } from "../services/telex-transfer.service";
import { TelexTransferResponseDto, GetAllTelexTransfersResponseDto } from "../dtos/telex-transfer-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";

export class TelexTransferController {
  /**
   * Create a new telex transfer
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await TelexTransferService.create(req.body);
      const telexTransferDto = toDto(TelexTransferResponseDto, result);
      const response = ResponseUtil.success("Telex transfer created successfully", telexTransferDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get telex transfer by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await TelexTransferService.getById(id);
      const telexTransferDto = toDto(TelexTransferResponseDto, result);
      const response = ResponseUtil.success("Telex transfer retrieved successfully", telexTransferDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all telex transfers with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await TelexTransferService.getAll(query);

      const telexTransfersDto = toDtoList(TelexTransferResponseDto, result.telexTransfers);

      const responseData: GetAllTelexTransfersResponseDto = {
        telexTransfers: telexTransfersDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success("Telex transfers list retrieved successfully", responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update telex transfer by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await TelexTransferService.update(id, req.body);
      const telexTransferDto = toDto(TelexTransferResponseDto, result);
      const response = ResponseUtil.success("Telex transfer updated successfully", telexTransferDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete telex transfer by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await TelexTransferService.delete(id);
      const response = ResponseUtil.success("Telex transfer deleted successfully", null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
