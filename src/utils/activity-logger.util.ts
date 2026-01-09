import { ActivityLogService } from '../services/activity-log.service';
import { ActivityType, ActivityModule } from '../constants/activity-log.constants';

/**
 * Simplified helper for activity logging
 * Handles errors silently to prevent breaking main operations
 */
export class ActivityLogger {
  /**
   * Log an activity with simplified config
   */
  static async log(config: {
    userId: string;
    employeeId: string;
    type: ActivityType;
    action: string;
    module: ActivityModule;
    entity: { type: string; id: any };
    description: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await ActivityLogService.logActivity({
        userId: config.userId,
        employeeId: config.employeeId,
        activityType: config.type,
        action: config.action,
        module: config.module,
        entityType: config.entity.type,
        entityId: config.entity.id,
        description: config.description,
        metadata: config.metadata
      });
    } catch (error) {
      // Silent fail - activity logging is non-critical
      // Errors are already logged by ActivityLogService
    }
  }
}
