import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { DashboardUserResponseDto } from '../dtos/dashboard-dto';
import { toDto } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class DashboardController {
  /**
   * Get user dashboard data
   */
  static async getUserDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      const dashboardData = await DashboardService.getUserDashboard(employeeId);
      const dashboardDto = toDto(DashboardUserResponseDto, dashboardData);
      
      const response = ResponseUtil.success(
        INFO_MESSAGES.DASHBOARD.USER_DASHBOARD_RETRIEVED_SUCCESSFULLY, 
        dashboardDto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { 
        method: 'getUserDashboard', 
        employeeId: req.params.employeeId 
      });
    }
  }
}
