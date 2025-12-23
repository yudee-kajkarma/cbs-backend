import { Request, Response } from "express";
import { PayrollCompensationService } from "../services/payroll-compensation.service";
import { PayrollCompensationResponseDto } from "../dtos/payroll-compensation-dto";
import { toDto } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class PayrollCompensationController {
  /**
   * Create payroll compensation settings
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await PayrollCompensationService.create(req.body);
      const payrollCompensationDto = toDto(PayrollCompensationResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYROLL_COMPENSATION.CREATED_SUCCESSFULLY, payrollCompensationDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get payroll compensation settings 
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const result = await PayrollCompensationService.get();
      const payrollCompensationDto = toDto(PayrollCompensationResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYROLL_COMPENSATION.RETRIEVED_SUCCESSFULLY, payrollCompensationDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'get' });
    }
  }

  /**
   * Update payroll compensation settings
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await PayrollCompensationService.update(req.body);
      const payrollCompensationDto = toDto(PayrollCompensationResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.PAYROLL_COMPENSATION.UPDATED_SUCCESSFULLY, payrollCompensationDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', data: req.body });
    }
  }
}
