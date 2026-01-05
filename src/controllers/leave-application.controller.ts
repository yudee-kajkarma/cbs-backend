import { Request, Response } from "express";
import { LeaveApplicationService } from "../services/leave-application.service";
import { LeaveApplicationResponseDto, GetAllLeaveApplicationsResponseDto } from "../dtos/leave-application-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class LeaveApplicationController {
  /**
   * Create a new leave application
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const result = await LeaveApplicationService.create({ ...req.body, employeeId });
      const leaveApplicationDto = toDto(LeaveApplicationResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_APPLICATION.CREATED_SUCCESSFULLY, leaveApplicationDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', employeeId: req.params.employeeId, data: req.body });
    }
  }

  /**
   * Get leave application by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await LeaveApplicationService.getById(id);
      const leaveApplicationDto = toDto(LeaveApplicationResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_APPLICATION.RETRIEVED_SUCCESSFULLY, leaveApplicationDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all leave applications with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await LeaveApplicationService.getAll(query);

      const leaveApplicationsDto = toDtoList(LeaveApplicationResponseDto, result.leaveApplications);

      const responseData: GetAllLeaveApplicationsResponseDto = {
        leaveApplications: leaveApplicationsDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_APPLICATION.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update leave application by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await LeaveApplicationService.update(id, req.body);
      const leaveApplicationDto = toDto(LeaveApplicationResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_APPLICATION.UPDATED_SUCCESSFULLY, leaveApplicationDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete leave application by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await LeaveApplicationService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_APPLICATION.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }

  /**
   * Update leave application status (approve/reject)
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id, action, approvedBy } = req.params;
      const { rejectionReason } = req.body;
      
      const result = await LeaveApplicationService.updateStatus(id, action as 'approve' | 'reject', approvedBy, rejectionReason);
      
      const message = action === 'approve' 
        ? INFO_MESSAGES.LEAVE_APPLICATION.APPROVED_SUCCESSFULLY 
        : INFO_MESSAGES.LEAVE_APPLICATION.REJECTED_SUCCESSFULLY;
      
      const leaveApplicationDto = toDto(LeaveApplicationResponseDto, result);
      const response = ResponseUtil.success(message, leaveApplicationDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'updateStatus', id: req.params.id, action: req.params.action, approvedBy: req.params.approvedBy, data: req.body });
    }
  }

  /**
   * Get employee leave summary with statistics
   */
  static async getEmployeeLeaveSummary(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const query = res.locals.validatedQuery || req.query;
      
      const result = await LeaveApplicationService.getEmployeeLeaveSummary(employeeId, query);

      const leaveApplicationsDto = toDtoList(LeaveApplicationResponseDto, result.leaveApplications);

      const responseData = {
        summary: result.summary,
        leaveApplications: leaveApplicationsDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(
        INFO_MESSAGES.LEAVE_APPLICATION.LIST_RETRIEVED_SUCCESSFULLY,
        responseData
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getEmployeeLeaveSummary', employeeId: req.params.employeeId, query: req.query });
    }
  }
}
