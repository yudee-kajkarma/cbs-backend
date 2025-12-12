import { Request, Response } from "express";
import { LicenseService } from "../services/license.service";
import { LicenseResponseDto, GetAllLicensesResponseDto } from "../dtos/license-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class LicenseController {
  /**
   * Create a new license
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await LicenseService.create(req.body);
      const dto = toDto(LicenseResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LICENSE.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all licenses with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await LicenseService.getAll(req.query);
      const licenseDto = toDtoList(LicenseResponseDto, result.licenses);
      const responseData = {
        licenses: licenseDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.LICENSE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get license by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await LicenseService.getOne(id);
      const dto = toDto(LicenseResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LICENSE.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update license by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await LicenseService.update(id, req.body);
      const dto = toDto(LicenseResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LICENSE.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete license by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await LicenseService.remove(id);
      const response = ResponseUtil.success(INFO_MESSAGES.LICENSE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}