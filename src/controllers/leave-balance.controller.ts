import { Request, Response } from "express";
import { LeaveBalanceService } from "../services/leave-balance.service";
import { LeaveBalanceResponseDto, GetAllLeaveBalancesResponseDto } from "../dtos/leave-balance-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class LeaveBalanceController {
  /**
   * Initialize leave balance for an employee
   */
  static async initialize(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, year } = req.body;
      const result = await LeaveBalanceService.initializeForEmployee(employeeId, year);
      const leaveBalanceDto = toDto(LeaveBalanceResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_BALANCE.INITIALIZED_SUCCESSFULLY, leaveBalanceDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'initialize', data: req.body });
    }
  }

  /**
   * Get leave balance by employee ID (optionally specify year via query param)
   */
  static async getByEmployeeId(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const result = await LeaveBalanceService.getByEmployeeAndYear(employeeId, year);
      const leaveBalanceDto = toDto(LeaveBalanceResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_BALANCE.RETRIEVED_SUCCESSFULLY, leaveBalanceDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getByEmployeeId', employeeId: req.params.employeeId });
    }
  }

  /**
   * Get all leave balances with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await LeaveBalanceService.getAll(query);

      const leaveBalancesDto = toDtoList(LeaveBalanceResponseDto, result.leaveBalances);

      const responseData: GetAllLeaveBalancesResponseDto = {
        leaveBalances: leaveBalancesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_BALANCE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update leave balance by employee ID (optionally specify year via query param)
   */
  static async updateByEmployeeId(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const result = await LeaveBalanceService.updateByEmployeeAndYear(employeeId, year, req.body);
      const leaveBalanceDto = toDto(LeaveBalanceResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_BALANCE.UPDATED_SUCCESSFULLY, leaveBalanceDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'updateByEmployeeId', employeeId: req.params.employeeId, data: req.body });
    }
  }

  /**
   * Delete leave balance by employee ID (optionally specify year via query param)
   */
  static async deleteByEmployeeId(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      await LeaveBalanceService.deleteByEmployeeAndYear(employeeId, year);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_BALANCE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'deleteByEmployeeId', employeeId: req.params.employeeId });
    }
  }
}
