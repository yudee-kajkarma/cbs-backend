import { Request, Response } from "express";
import { LeavePolicyService } from "../services/leave-policy.service";
import { LeavePolicyResponseDto } from "../dtos/leave-policy-dto";
import { toDto } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class LeavePolicyController {
  /**
   * Get leave policy 
   */
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const result = await LeavePolicyService.get();
      const leavePolicyDto = toDto(LeavePolicyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_POLICY.RETRIEVED_SUCCESSFULLY, leavePolicyDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'get' });
    }
  }

  /**
   * Update leave policy
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await LeavePolicyService.update(req.body);
      const leavePolicyDto = toDto(LeavePolicyResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.LEAVE_POLICY.UPDATED_SUCCESSFULLY, leavePolicyDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', data: req.body });
    }
  }
}
