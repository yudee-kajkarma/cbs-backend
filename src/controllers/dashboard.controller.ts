import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { 
  AttendanceOverviewResponseDto, 
  LeaveOverviewResponseDto, 
  LeaveApplicationsOverviewResponseDto, 
  ActivityLogOverviewResponseDto,
  HRStatisticsResponseDto,
  HRActivityFeedResponseDto
} from '../dtos/dashboard-dto';
import { toDto } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class DashboardController {
  /**
   * Get attendance overview
   */
  static async getAttendanceOverview(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const result = await DashboardService.getAttendanceOverview(employeeId);
      const attendanceDto = toDto(AttendanceOverviewResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DASHBOARD.ATTENDANCE_OVERVIEW_RETRIEVED_SUCCESSFULLY, attendanceDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAttendanceOverview', employeeId: req.params.employeeId });
    }
  }

  /**
   * Get leave overview
   */
  static async getLeaveOverview(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const result = await DashboardService.getLeaveOverview(employeeId);
      const leaveDto = toDto(LeaveOverviewResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DASHBOARD.LEAVE_OVERVIEW_RETRIEVED_SUCCESSFULLY, leaveDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getLeaveOverview', employeeId: req.params.employeeId });
    }
  }

  /**
   * Get leave applications overview
   */
  static async getLeaveApplicationsOverview(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const result = await DashboardService.getLeaveApplicationsOverview(employeeId);
      const applicationsDto = toDto(LeaveApplicationsOverviewResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DASHBOARD.LEAVE_APPLICATIONS_RETRIEVED_SUCCESSFULLY, applicationsDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getLeaveApplicationsOverview', employeeId: req.params.employeeId });
    }
  }

  /**
   * Get activity log overview
   */
  static async getActivityLogOverview(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await DashboardService.getActivityLogOverview(employeeId, limit);
      const activityDto = toDto(ActivityLogOverviewResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DASHBOARD.ACTIVITY_LOG_RETRIEVED_SUCCESSFULLY, activityDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getActivityLogOverview', employeeId: req.params.employeeId });
    }
  }

  /**
   * Get HR dashboard statistics
   */
  static async getHRStatistics(req: Request, res: Response): Promise<void> {
    try {
      const result = await DashboardService.getHRStatistics();
      const statisticsDto = toDto(HRStatisticsResponseDto, { statistics: result });
      const response = ResponseUtil.success(INFO_MESSAGES.DASHBOARD.HR_STATISTICS_RETRIEVED_SUCCESSFULLY, statisticsDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getHRStatistics' });
    }
  }

  /**
   * Get HR activity feed
   */
  static async getHRActivityFeed(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await DashboardService.getHRActivityFeed(limit);
      const activityDto = toDto(HRActivityFeedResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.DASHBOARD.HR_ACTIVITY_FEED_RETRIEVED_SUCCESSFULLY, activityDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getHRActivityFeed' });
    }
  }
}
