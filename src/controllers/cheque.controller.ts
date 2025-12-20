import { Request, Response } from "express";
import { ChequeService } from "../services/cheque.service";
import { ChequeWithBankResponseDto } from "../dtos/cheque-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class ChequeController {
  /**
   * Create a new cheque
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await ChequeService.create(req.body);
      const dto = toDto(ChequeWithBankResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.CHEQUE.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all cheques with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await ChequeService.getAll(req.query);
      const chequeDto = toDtoList(ChequeWithBankResponseDto, result.cheques);
      const responseData = {
        cheques: chequeDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.CHEQUE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get cheque by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ChequeService.getOne(id);
      const dto = toDto(ChequeWithBankResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.CHEQUE.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update cheque by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ChequeService.update(id, req.body);
      const dto = toDto(ChequeWithBankResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.CHEQUE.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete cheque by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ChequeService.remove(id);
      const response = ResponseUtil.success(INFO_MESSAGES.CHEQUE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
