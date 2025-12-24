import { Request, Response } from 'express';
import { IncentiveService } from '../services/incentive.service';
import { IncentiveResponseDto, GetAllIncentivesResponseDto } from '../dtos/incentive-dto';
import { toDto, toDtoList } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class IncentiveController {
  /**
   * Create a new incentive
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await IncentiveService.create(req.body);
      const incentiveDto = toDto(IncentiveResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.INCENTIVE.CREATED_SUCCESSFULLY, incentiveDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get incentive by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await IncentiveService.getById(id);
      const incentiveDto = toDto(IncentiveResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.INCENTIVE.RETRIEVED_SUCCESSFULLY, incentiveDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all incentives with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await IncentiveService.getAll(query);
      
      const incentivesDto = toDtoList(IncentiveResponseDto, result.incentives);
      
      const responseData: GetAllIncentivesResponseDto = {
        incentives: incentivesDto,
        totalAmount: result.totalAmount,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.INCENTIVE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update incentive by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await IncentiveService.update(id, req.body);
      const incentiveDto = toDto(IncentiveResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.INCENTIVE.UPDATED_SUCCESSFULLY, incentiveDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete incentive by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await IncentiveService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.INCENTIVE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
