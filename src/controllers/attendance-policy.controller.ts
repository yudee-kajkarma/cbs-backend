import { Request, Response } from "express";
import { AttendancePolicyService } from "../services/attendance-policy.service";
import { AttendancePolicyResponseDto } from "../dtos/attendance-policy-dto";
import { toDto } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class AttendancePolicyController {
  /**
   * Create attendance policy
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await AttendancePolicyService.create(req.body);
      const attendancePolicyDto = toDto(AttendancePolicyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ATTENDANCE_POLICY.CREATED_SUCCESSFULLY, attendancePolicyDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get attendance policy 
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const result = await AttendancePolicyService.get();
      const attendancePolicyDto = toDto(AttendancePolicyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ATTENDANCE_POLICY.RETRIEVED_SUCCESSFULLY, attendancePolicyDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'get' });
    }
  }

  /**
   * Update attendance policy
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await AttendancePolicyService.update(req.body);
      const attendancePolicyDto = toDto(AttendancePolicyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ATTENDANCE_POLICY.UPDATED_SUCCESSFULLY, attendancePolicyDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', data: req.body });
    }
  }
}
