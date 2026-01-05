import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activity-log.service';
import { ActivityLogResponseDto } from '../dtos/activity-log-dto';
import { toDtoList } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ActivityModule, ActivityType } from '../constants/activity-log.constants';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

export class ActivityLogController {
  /**
   * Get recent activities for a user
   */
  static async getRecentActivities(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await ActivityLogService.getRecentActivities(userId, limit);
      const activitiesDto = toDtoList(ActivityLogResponseDto, activities);
      const response = ResponseUtil.success(INFO_MESSAGES.ACTIVITY_LOG.ACTIVITIES_RETRIEVED_SUCCESSFULLY, activitiesDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getRecentActivities', userId: req.params.userId });
    }
  }

  /**
   * Get recent activities for an employee
   */
  static async getRecentActivitiesByEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await ActivityLogService.getRecentActivitiesByEmployee(employeeId, limit);
      const activitiesDto = toDtoList(ActivityLogResponseDto, activities);
      const response = ResponseUtil.success(INFO_MESSAGES.ACTIVITY_LOG.ACTIVITIES_RETRIEVED_SUCCESSFULLY, activitiesDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getRecentActivitiesByEmployee', employeeId: req.params.employeeId });
    }
  }

  /**
   * Delete old activity logs (cleanup)
   */
  static async deleteOldActivities(req: Request, res: Response): Promise<void> {
    try {
      const daysToKeep = req.query.daysToKeep ? parseInt(req.query.daysToKeep as string) : 90;
      await ActivityLogService.deleteOldActivities(daysToKeep);
      const response = ResponseUtil.success(INFO_MESSAGES.ACTIVITY_LOG.OLD_ACTIVITIES_DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'deleteOldActivities' });
    }
  }
}
