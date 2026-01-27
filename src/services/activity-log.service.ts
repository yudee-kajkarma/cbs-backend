import { ActivityLog } from "../models";
import { ErrorHandler } from "../utils/error-handler.util";
import {
  ActivityLogDocument,
  CreateActivityLogData,
} from "../interfaces/model.interface";

export class ActivityLogService {
  
  /**
   * Log a user activity
   */
  static async logActivity(data: CreateActivityLogData): Promise<ActivityLogDocument> {
    try {
      const activityLog = await ActivityLog.create(data);
      return activityLog.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'ActivityLogService', 
        method: 'logActivity', 
        data 
      });
    }
  }

  /**
   * Get recent activities for a user
   */
  static async getRecentActivities(userId?: string, limit: number = 10): Promise<any[]> {
    try {
      const query = userId ? { userId } : {};
      const activities = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return activities;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'ActivityLogService', 
        method: 'getRecentActivities', 
        userId, 
        limit 
      });
    }
  }

  /**
   * Get recent activities for an employee
   */
  static async getRecentActivitiesByEmployee(employeeId: string, limit: number = 10): Promise<any[]> {
    try {
      const activities = await ActivityLog.find({ employeeId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return activities;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'ActivityLogService', 
        method: 'getRecentActivitiesByEmployee', 
        employeeId, 
        limit 
      });
    }
  }

  /**
   * Delete old activity logs (for cleanup/archival)
   */
  static async deleteOldActivities(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await ActivityLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      return result.deletedCount || 0;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'ActivityLogService', 
        method: 'deleteOldActivities', 
        daysToKeep 
      });
    }
  }
}
