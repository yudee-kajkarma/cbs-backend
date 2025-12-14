import { Request, Response } from "express";
import { AuditService } from "../services/audit.service";
import { AuditResponseDto, GetAllAuditsResponseDto } from "../dtos/audit-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class AuditController {
  /**
   * Create a new audit
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuditService.create(req.body);
      const auditDto = toDto(AuditResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.AUDIT.CREATED_SUCCESSFULLY, auditDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get audit by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AuditService.getById(id);
      const auditDto = toDto(AuditResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.AUDIT.RETRIEVED_SUCCESSFULLY, auditDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all audits with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await AuditService.getAll(query);

      const auditsDto = toDtoList(AuditResponseDto, result.audits);

      const responseData: GetAllAuditsResponseDto = {
        audits: auditsDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.AUDIT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update audit by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AuditService.update(id, req.body);
      const auditDto = toDto(AuditResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.AUDIT.UPDATED_SUCCESSFULLY, auditDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete audit by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await AuditService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.AUDIT.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
