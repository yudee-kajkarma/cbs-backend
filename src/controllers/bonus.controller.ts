import { Request, Response } from 'express';
import { BonusService } from '../services/bonus.service';
import { BonusResponseDto, GetAllBonusesResponseDto } from '../dtos/bonus-dto';
import { toDto, toDtoList } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class BonusController {
  /**
   * Create a new bonus
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await BonusService.create(req.body);
      const bonusDto = toDto(BonusResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BONUS.CREATED_SUCCESSFULLY, bonusDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get bonus by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BonusService.getById(id);
      const bonusDto = toDto(BonusResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BONUS.RETRIEVED_SUCCESSFULLY, bonusDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all bonuses with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await BonusService.getAll(query);
      
      const bonusesDto = toDtoList(BonusResponseDto, result.bonuses);
      
      const responseData: GetAllBonusesResponseDto = {
        bonuses: bonusesDto,
        totalAmount: result.totalAmount,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.BONUS.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update bonus by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BonusService.update(id, req.body);
      const bonusDto = toDto(BonusResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BONUS.UPDATED_SUCCESSFULLY, bonusDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete bonus by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await BonusService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.BONUS.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
