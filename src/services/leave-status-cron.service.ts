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
   */
  static startYearlyLeaveBalanceInitializer(): void {
    cron.schedule('1 0 1 1 *', async () => {
      await this.runYearlyLeaveBalanceInitializer();
    });
  }

  /**
   * Execute yearly leave balance initialization
   */
  private static async runYearlyLeaveBalanceInitializer(): Promise<void> {
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
        } catch (error: any) {
          if (error?.code === 'CBS-4008-1') {
            skipCount++;
          } else {
            errorCount++;
          }
        }
      }
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
    cron.schedule('0 0 * * *', async () => {
      await this.runLeaveStatusUpdater();
    });
  }

  /**
   * Execute leave status updates and auto-rejections
   */
  private static async runLeaveStatusUpdater(): Promise<void> {
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update employee statuses based on approved leaves
      await this.updateEmployeeStatuses(today);

      // Auto-reject expired pending applications
      await this.autoRejectExpiredApplications(today);

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
    }
  }
}
