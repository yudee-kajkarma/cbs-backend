import { Request, Response } from "express";
import { SimService } from "../services/sim.service";
import { SIMResponseDto, GetAllSIMsResponseDto } from "../dtos/sim-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class SimController {
  /**
   * Create a new SIM
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await SimService.create(req.body);
      const dto = toDto(SIMResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SIM.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all SIMs with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await SimService.getAll(req.query);
      const simsDto = toDtoList(SIMResponseDto, result.sims);
      const responseData = {
        sims: simsDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.SIM.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get SIM by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SimService.getById(id);
      const dto = toDto(SIMResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SIM.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update SIM by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await SimService.update(id, req.body);
      const dto = toDto(SIMResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.SIM.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete SIM by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await SimService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.SIM.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
