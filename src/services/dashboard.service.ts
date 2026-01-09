import Attendance from "../models/attendance.model";
import LeaveApplication from "../models/leaveApplication.model";
import LeaveBalance from "../models/leaveBalance.model";
import MonthlyPayroll from "../models/monthlyPayroll.model";
import ActivityLog from "../models/activity-log.model";
import { AttendanceService } from "./attendance.service";
import { AttendancePolicyService } from "./attendance-policy.service";
import { ActivityLogService } from "./activity-log.service";
import { EmployeeService } from "./employee.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { AttendanceUtil } from "../utils/attendance.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { LeaveApplicationStatus } from "../constants/leave-policy.constants";
import { EmployeeStatus } from "../constants";
import { ActivityType } from "../constants/activity-log.constants";
import { ActivityLogDocument } from "../interfaces";

export class DashboardService {

  /**
   * Get attendance overview for dashboard
   */
  static async getAttendanceOverview(employeeId: string): Promise<any> {
    try {
      const employee = await EmployeeService.getById(employeeId);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const policy = await AttendancePolicyService.get();

      const [todayAttendance, monthlyStats] = await Promise.all([
        this.getTodayAttendance(employeeId),
        AttendanceService.getMonthlyStatistics(employeeId, currentMonth, currentYear),
      ]);

      // Attendance status
      const attendanceStatus = {
        isCheckedIn: !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime,
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        status: todayAttendance?.status || 'Not Marked',
      };

      // Attendance rate
      const attendanceRate = {
        presentDays: monthlyStats.presentDays,
        totalWorkingDays: monthlyStats.totalWorkingDays,
        attendancePercentage: monthlyStats.totalWorkingDays > 0 
          ? Math.round((monthlyStats.presentDays / monthlyStats.totalWorkingDays) * 100 * 10) / 10
          : 0,
      };

      // Monthly overview
      const monthlyOverview = {
        daysPresent: monthlyStats.presentDays,
        daysAbsent: monthlyStats.absentDays,
        totalWorkingDays: monthlyStats.totalWorkingDays,
      };

      // Working hours
      const workingDaysInMonth = AttendanceUtil.getWorkingDaysInMonth(
        currentMonth,
        currentYear,
        policy
      );
      const targetHours = workingDaysInMonth * policy.standardHoursPerDay;

      const workingHours = {
        totalHours: monthlyStats.totalWorkingHours,
        targetHours: targetHours,
        averageDaily: monthlyStats.averageWorkingHours,
        expectedDaily: policy.standardHoursPerDay,
        todayHours: todayAttendance?.workingHours || 0,
      };

      return {
        attendanceStatus,
        attendanceRate,
        monthlyOverview,
        workingHours,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getAttendanceOverview', 
        employeeId 
      });
    }
  }

  /**
   * Get leave overview for dashboard
   */
  static async getLeaveOverview(employeeId: string): Promise<any> {
    try {
      // Verify employee exists
      const employee = await EmployeeService.getById(employeeId);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const currentYear = new Date().getFullYear();

      const [leaveBalance, upcomingLeaves] = await Promise.all([
        this.getLeaveBalanceData(employeeId, currentYear),
        this.getUpcomingLeaves(employeeId),
      ]);

      // Leave summary
      const leaveSummary = {
        totalAllocated: leaveBalance.totalAllocated,
        totalUsed: leaveBalance.totalUsed,
        totalRemaining: leaveBalance.totalRemaining,
        totalPending: leaveBalance.totalPending,
      };

      return {
        leaveSummary,
        upcomingLeaves,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getLeaveOverview', 
        employeeId 
      });
    }
  }

  /**
   * Get leave applications for dashboard
   */
  static async getLeaveApplicationsOverview(employeeId: string): Promise<any> {
    try {
      const employee = await EmployeeService.getById(employeeId);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const myLeaveApplications = await this.getMyLeaveApplications(employeeId);

      return {
        myLeaveApplications,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getLeaveApplicationsOverview', 
        employeeId 
      });
    }
  }

  /**
   * Get activity log for dashboard
   */
  static async getActivityLogOverview(employeeId: string, limit: number = 10): Promise<any> {
    try {
      // Verify employee exists
      const employee = await EmployeeService.getById(employeeId);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      // Define employee dashboard relevant activity types only
      const employeeDashboardActivityTypes = [
        ActivityType.CHECK_IN,
        ActivityType.CHECK_OUT,
        ActivityType.LEAVE_APPROVE,
        ActivityType.LEAVE_REJECT,
      ];

      // Get recent activities filtered by employee dashboard types
      const recentActivities = await ActivityLog.find({
        employeeId,
        activityType: { $in: employeeDashboardActivityTypes }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        recentActivities: recentActivities.map((activity: ActivityLogDocument) => ({
          activityType: activity.activityType,
          action: activity.action,
          description: activity.description,
          module: activity.module,
          metadata: activity.metadata,
        })),
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getActivityLogOverview', 
        employeeId 
      });
    }
  }

  /**
   * Get today's attendance record
   */
  private static async getTodayAttendance(employeeId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    }).lean();

    return attendance;
  }

  /**
   * Get leave balance data with pending calculations
   */
  private static async getLeaveBalanceData(employeeId: string, year: number): Promise<any> {
    try {
      const leaveBalance = await LeaveBalance.findOne({ employeeId, year }).lean();

      if (!leaveBalance) {
        return {
          annualLeave: { totalAllocation: 0, used: 0, remaining: 0, pending: 0 },
          sickLeave: { totalAllocation: 0, used: 0, remaining: 0, pending: 0 },
          emergencyLeave: { totalAllocation: 0, used: 0, remaining: 0, pending: 0 },
          totalAllocated: 0,
          totalUsed: 0,
          totalRemaining: 0,
          totalPending: 0,
        };
      }

      // Get pending leave applications
      const pendingLeaves = await LeaveApplication.find({
        employeeId,
        status: LeaveApplicationStatus.PENDING,
      }).lean();

      // Calculate pending days by leave type
      let pendingAnnual = 0;
      let pendingSick = 0;
      let pendingEmergency = 0;

      pendingLeaves.forEach((leave: any) => {
        const days = leave.numberOfDays || 0;
        if (leave.leaveType === 'Annual Leave') pendingAnnual += days;
        else if (leave.leaveType === 'Sick Leave') pendingSick += days;
        else if (leave.leaveType === 'Emergency Leave') pendingEmergency += days;
      });

      const totalPending = pendingAnnual + pendingSick + pendingEmergency;

      return {
        totalAllocated: 
          (leaveBalance.annualLeave?.totalAllocation || 0) +
          (leaveBalance.sickLeave?.totalAllocation || 0) +
          (leaveBalance.emergencyLeave?.totalAllocation || 0),
        totalUsed: 
          (leaveBalance.annualLeave?.used || 0) +
          (leaveBalance.sickLeave?.used || 0) +
          (leaveBalance.emergencyLeave?.used || 0),
        totalRemaining: 
          (leaveBalance.annualLeave?.remaining || 0) +
          (leaveBalance.sickLeave?.remaining || 0) +
          (leaveBalance.emergencyLeave?.remaining || 0),
        totalPending,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getLeaveBalanceData', 
        employeeId, 
        year 
      });
    }
  }

  /**
   * Get upcoming approved leaves (next 30 days)
   */
  private static async getUpcomingLeaves(employeeId: string): Promise<any[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);
      next30Days.setHours(23, 59, 59, 999);

      const upcomingLeaves = await LeaveApplication.find({
        employeeId,
        status: LeaveApplicationStatus.APPROVED,
        startDate: { $gte: today, $lte: next30Days },
      })
        .select('leaveType startDate endDate numberOfDays')
        .sort({ startDate: 1 })
        .limit(5)
        .lean();

      return upcomingLeaves.map((leave: any) => ({
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        numberOfDays: leave.numberOfDays,
      }));
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getUpcomingLeaves', 
        employeeId 
      });
    }
  }

  /**
   * Get my leave applications
   */
  private static async getMyLeaveApplications(employeeId: string): Promise<any[]> {
    try {
      const leaveApplications = await LeaveApplication.find({ employeeId })
        .populate('approvedBy', 'fullName')
        .sort({ submittedDate: -1 })
        .limit(10)
        .lean();

      return leaveApplications.map((leave: any) => ({
        requestId: leave.requestId,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        numberOfDays: leave.numberOfDays,
        status: leave.status,
        submittedDate: leave.submittedDate,
        approvedBy: leave.approvedBy?.fullName || null,
        approvalDate: leave.approvalDate || null,
        reason: leave.reason || null,
      }));
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getMyLeaveApplications', 
        employeeId 
      });
    }
  }
  /**
   * Get HR dashboard statistics
   */
  static async getHRStatistics(): Promise<any> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      // Total employees count
      const employeeResult = await EmployeeService.getAll({
        status: `${EmployeeStatus.ACTIVE},${EmployeeStatus.ON_LEAVE}`,
        limit: Number.MAX_SAFE_INTEGER,
        page: 1
      });
      const totalEmployees = employeeResult.pagination.totalCount;

      // Present today count (checked in today)
      const presentToday = await Attendance.countDocuments({
        date: today,
        checkInTime: { $exists: true }
      });

      // On leave today count
      const onLeaveToday = await LeaveApplication.countDocuments({
        status: LeaveApplicationStatus.APPROVED,
        startDate: { $lte: today },
        endDate: { $gte: today }
      });

      // Monthly payroll total for current month
      const payrollRecords = await MonthlyPayroll.find({
        month: currentMonth,
        year: currentYear
      }).lean();

      const monthlyPayrollTotal = payrollRecords.reduce((sum, record: any) => {
        return sum + (record.netSalary || 0);
      }, 0);

      return {
        totalEmployees,
        presentToday,
        onLeaveToday,
        monthlyPayrollTotal: Math.round(monthlyPayrollTotal * 100) / 100
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getHRStatistics'
      });
    }
  }

  /**
   * Get HR activity feed
   */
  static async getHRActivityFeed(limit: number = 10): Promise<any> {
    try {
      // Define HR-relevant activity types only
      const hrActivityTypes = [
        ActivityType.LEAVE_SUBMIT,
        ActivityType.LEAVE_APPROVE,
        ActivityType.LEAVE_REJECT,
        ActivityType.PAYROLL_CREATE,
        ActivityType.BONUS_CREATE,
        ActivityType.INCENTIVE_CREATE,
        ActivityType.EMPLOYEE_ONBOARD,
      ];

      // Get recent activities filtered by HR-relevant types
      const activities = await ActivityLog.find({
        activityType: { $in: hrActivityTypes }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        recentActivities: activities.map((activity: ActivityLogDocument) => ({
          activityType: activity.activityType,
          action: activity.action,
          description: activity.description,
          module: activity.module,
          metadata: activity.metadata,
        })),
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getHRActivityFeed'
      });
    }
  }
}

