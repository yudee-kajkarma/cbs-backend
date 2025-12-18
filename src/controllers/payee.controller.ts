import { Request, Response } from "express";
import { PayeeService } from "../services/payee.service";
import { PayeeResponseDto, GetAllPayeesResponseDto } from "../dtos/payee-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class PayeeController {
  /**
   * Create a new payee
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await PayeeService.create(req.body);
      const payeeDto = toDto(PayeeResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYEE.CREATED_SUCCESSFULLY, payeeDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get payee by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PayeeService.getById(id);
      const payeeDto = toDto(PayeeResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYEE.RETRIEVED_SUCCESSFULLY, payeeDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all payees with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await PayeeService.getAll(query);

      const payeesDto = toDtoList(PayeeResponseDto, result.payees);

      const responseData: GetAllPayeesResponseDto = {
        payees: payeesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.PAYEE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update a payee
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PayeeService.update(id, req.body);
      const payeeDto = toDto(PayeeResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYEE.UPDATED_SUCCESSFULLY, payeeDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete a payee
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PayeeService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYEE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
