import { Request, Response } from "express";
import { BankBalanceService } from "../services/bankBalance.service";
import { BankBalanceResponseDto, BankBalanceSummaryDto } from "../dtos/bank-balance-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class BankBalanceController {
  /**
   * Create a new bank balance entry
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await BankBalanceService.create(req.body);
      const dto = toDto(BankBalanceResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all bank balances with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await BankBalanceService.getAll(req.query);
      const bankBalancesDto = toDtoList(BankBalanceResponseDto, result.bankBalances);
      const responseData = {
        bankBalances: bankBalancesDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get bank balance by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BankBalanceService.getById(id);
      const dto = toDto(BankBalanceResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update bank balance by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BankBalanceService.update(id, req.body);
      const dto = toDto(BankBalanceResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete bank balance by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await BankBalanceService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }

  /**
   * Bulk update bank balances (for Excel view Save All Changes)
   */
  static async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { updates } = req.body;
      if (!Array.isArray(updates) || updates.length === 0) {
        const response = ResponseUtil.error('CBS-4000', 'Updates array is required and cannot be empty');
        res.status(400).json(response);
        return;
      }

      const result = await BankBalanceService.bulkUpdate(updates);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.BULK_UPDATED_SUCCESSFULLY, result);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'bulkUpdate', data: req.body });
    }
  }

  /**
   * Get bank balance summary/totals
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const baseCurrency = (req.query.baseCurrency as string) || 'KWD';
      const result = await BankBalanceService.getSummary(req.query, baseCurrency);
      const dto = toDto(BankBalanceSummaryDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_BALANCE.SUMMARY_RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getSummary', query: req.query });
    }
  }
}
