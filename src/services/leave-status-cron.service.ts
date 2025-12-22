import cron from 'node-cron';
import LeaveApplication from "../models/leaveApplication.model";
import Employee from "../models/employee.model";
import { LeaveApplicationStatus } from "../constants/leave-policy.constants";
import { EmployeeStatus } from "../constants/common.constants";
import { LeaveBalanceService } from "./leave-balance.service";
import { ErrorHandler } from "../utils/error-handler.util";

export class LeaveStatusCronService {
  
  /**
   * Initialize leave balances for all active employees for the new year
   * Runs once a year on January 1st at 00:01 (1 minute after midnight)
   */
  static startYearlyLeaveBalanceInitializer(): void {
    // Run on January 1st at 00:01 every year
    cron.schedule('1 0 1 1 *', async () => {
      await this.runYearlyLeaveBalanceInitializer();
    });

    console.log('[Cron] Yearly leave balance initializer scheduled to run on January 1st at 00:01');
  }

  /**
   * Execute yearly leave balance initialization
   */
  private static async runYearlyLeaveBalanceInitializer(): Promise<void> {
    console.log('[Cron] Running yearly leave balance initializer...');
    
    try {
      const newYear = new Date().getFullYear();
      
      const activeEmployees = await Employee.find({
        status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE] }
      });

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const employee of activeEmployees) {
        try {
          await LeaveBalanceService.initializeForEmployee(employee._id.toString(), newYear);
          successCount++;
          console.log(`[Cron] Leave balance initialized for employee ${employee.employeeId} for year ${newYear}`);
        } catch (error: any) {
          if (error?.code === 'CBS-4008-1') {
            skipCount++;
            console.log(`[Cron] Leave balance already exists for employee ${employee.employeeId} for year ${newYear}`);
          } else {
            errorCount++;
            console.error(`[Cron] Error initializing leave balance for employee ${employee.employeeId}:`, error);
          }
        }
      }

      console.log(`[Cron] Yearly leave balance initialization completed - Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveStatusCronService', method: 'runYearlyLeaveBalanceInitializer' });
    }
  }

  /**
   * Update employee status based on approved leave applications
   * and auto-reject pending leave applications that have passed their end date
   * Runs daily at midnight
   */
  static startLeaveStatusUpdater(): void {
    // Run every day at 00:00 (midnight)
    cron.schedule('0 0 * * *', async () => {
      await this.runLeaveStatusUpdater();
    });

    console.log('[Cron] Leave status updater scheduled to run daily at midnight');
  }

  /**
   * Execute leave status updates and auto-rejections
   */
  private static async runLeaveStatusUpdater(): Promise<void> {
    console.log('[Cron] Running leave status updater...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update employee statuses based on approved leaves
      await this.updateEmployeeStatuses(today);

      // Auto-reject expired pending applications
      await this.autoRejectExpiredApplications(today);

      console.log('[Cron] Leave status updater completed successfully');
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveStatusCronService', method: 'runLeaveStatusUpdater' });
    }
  }

  /**
   * Update employee statuses based on leave dates
   */
  private static async updateEmployeeStatuses(today: Date): Promise<void> {
    const approvedLeaves = await LeaveApplication.find({
      status: LeaveApplicationStatus.APPROVED,
    }).populate('employeeId');

    for (const leave of approvedLeaves) {
      const startDate = new Date(leave.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(leave.endDate);
      endDate.setHours(0, 0, 0, 0);

      const employee = await Employee.findById(leave.employeeId);
      
      if (!employee) continue;

      // Check if leave is starting today
      if (startDate.getTime() === today.getTime()) {
        if (employee.status === EmployeeStatus.ACTIVE) {
          await Employee.findByIdAndUpdate(leave.employeeId, {
            status: EmployeeStatus.ON_LEAVE
          });
          console.log(`[Cron] Employee ${employee.employeeId} status changed to ON_LEAVE (leave starts today)`);
        }
      }

      // Check if leave ended yesterday (today is the first day back)
      const dayAfterLeave = new Date(endDate);
      dayAfterLeave.setDate(dayAfterLeave.getDate() + 1);
      
      if (dayAfterLeave.getTime() === today.getTime()) {
        if (employee.status === EmployeeStatus.ON_LEAVE) {
          await Employee.findByIdAndUpdate(leave.employeeId, {
            status: EmployeeStatus.ACTIVE
          });
          console.log(`[Cron] Employee ${employee.employeeId} status changed to ACTIVE (leave ended)`);
        }
      }
    }
  }

  /**
   * Auto-reject pending leave applications whose end date has passed
   */
  private static async autoRejectExpiredApplications(today: Date): Promise<void> {
    const expiredPendingLeaves = await LeaveApplication.find({
      status: LeaveApplicationStatus.PENDING,
      endDate: { $lt: today }
    }).populate('employeeId');

    for (const leave of expiredPendingLeaves) {
      await LeaveApplication.findByIdAndUpdate(leave._id, {
        status: LeaveApplicationStatus.REJECTED,
        rejectionReason: 'Auto-rejected: Leave end date has passed without approval',
        actionDate: new Date(),
      });
      console.log(`[Cron] Leave application ${leave.requestId} auto-rejected (end date passed)`);
    }
  }
}
