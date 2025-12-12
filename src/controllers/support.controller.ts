import { Request, Response } from "express";
import { SupportService } from "../services/support.service";
import { SupportResponseDto } from "../dtos/support-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class SupportController {
  /**
   * Create a new support ticket
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await SupportService.create(req.body);
      const dto = toDto(SupportResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SUPPORT.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all support tickets with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await SupportService.getAll(req.query);
      const ticketsDto = toDtoList(SupportResponseDto, result.tickets);
      const responseData = {
        tickets: ticketsDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.SUPPORT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get support ticket by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SupportService.getById(id);
      const dto = toDto(SupportResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SUPPORT.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update support ticket by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SupportService.update(id, req.body);
      const dto = toDto(SupportResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SUPPORT.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete support ticket by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await SupportService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.SUPPORT.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
