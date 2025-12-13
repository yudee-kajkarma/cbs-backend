import { Request, Response } from "express";
import { BankAccountService } from "../services/bankAccount.service";
import { BankAccountResponseDto, GetAllBankAccountResponseDto } from "../dtos/bankAccount-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class BankAccountController {
  /**
   * Create a new bank account
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await BankAccountService.create(req.body);
      const dto = toDto(BankAccountResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_ACCOUNT.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all bank accounts with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await BankAccountService.getAll(req.query);
      const bankAccountDto = toDtoList(BankAccountResponseDto, result.bankAccounts);
      const responseData = {
        bankAccounts: bankAccountDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_ACCOUNT.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get bank account by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BankAccountService.getOne(id);
      const dto = toDto(BankAccountResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_ACCOUNT.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update bank account by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BankAccountService.update(id, req.body);
      const dto = toDto(BankAccountResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_ACCOUNT.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete bank account by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await BankAccountService.remove(id);
      const response = ResponseUtil.success(INFO_MESSAGES.BANK_ACCOUNT.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
