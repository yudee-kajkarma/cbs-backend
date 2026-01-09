import { Request, Response } from 'express';
import { MonthlyPayrollService } from '../services/monthly-payroll.service';
import { MonthlyPayrollResponseDto, GetAllPayrollsResponseDto, ProcessAllPayrollsResponseDto } from '../dtos/monthly-payroll-dto';
import { toDto, toDtoList } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class MonthlyPayrollController {
  /**
   * Get payroll by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await MonthlyPayrollService.getById(id);
      const payrollDto = toDto(MonthlyPayrollResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.MONTHLY_PAYROLL.RETRIEVED_SUCCESSFULLY, payrollDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all payrolls with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await MonthlyPayrollService.getAll(query);
      
      const payrollsDto = toDtoList(MonthlyPayrollResponseDto, result.payrolls);
      
      const responseData: GetAllPayrollsResponseDto = {
        payrolls: payrollsDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.MONTHLY_PAYROLL.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Process all pending payrolls for a given month/year
   */
  static async processAllPending(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.body;
      const result = await MonthlyPayrollService.processAllPending(month, year);
      const resultDto = toDto(ProcessAllPayrollsResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.MONTHLY_PAYROLL.BULK_PROCESSED_SUCCESSFULLY, resultDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'processAllPending', data: req.body });
    }
  }

  /**
   * Update payroll status
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id, status } = req.params;
      const result = await MonthlyPayrollService.update(id, { status });
      const payrollDto = toDto(MonthlyPayrollResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.MONTHLY_PAYROLL.UPDATED_SUCCESSFULLY, payrollDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, status: req.params.status });
    }
  }

  /**
   * Get payroll statistics for a specific month and year
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query;
      const result = await MonthlyPayrollService.getStatistics(Number(month), Number(year));
      const response = ResponseUtil.success(INFO_MESSAGES.MONTHLY_PAYROLL.RETRIEVED_SUCCESSFULLY, result);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getStatistics', query: req.query });
    }
  }

  /**
   * Export payroll report for a specific month and year as CSV
   */
  static async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query;
      const csv = await MonthlyPayrollService.exportReport(Number(month), Number(year));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="payroll-${year}-${month}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'exportReport', query: req.query });
    }
  }

  /**
   * Recalculate/update payroll for all active employees
   */
  static async recalculateAllPayrolls(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.body;
      const result = await MonthlyPayrollService.recalculateAllEmployees(month, year);
      const response = ResponseUtil.success(INFO_MESSAGES.MONTHLY_PAYROLL.BULK_RECALCULATED_SUCCESSFULLY, result);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'recalculateAllPayrolls', data: req.body });
    }
  }
}
