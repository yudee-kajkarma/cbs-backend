import Employee from "../models/employee.model";
import Attendance from "../models/attendance.model";
import LeaveApplication from "../models/leaveApplication.model";
import LeaveBalance from "../models/leaveBalance.model";
import { AttendanceService } from "./attendance.service";
import { AttendancePolicyService } from "./attendance-policy.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { AttendanceUtil } from "../utils/attendance.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { LeaveApplicationStatus } from "../constants/leave-policy.constants";
import { PopulatedEmployee } from "../interfaces/model.interface";

export class DashboardService {

  /**
   * Get comprehensive dashboard data for a user
   */
  static async getUserDashboard(employeeId: string): Promise<any> {
    try {
      // Verify employee exists
      const employee = await Employee.findById(employeeId)
        .populate('userId', 'fullName email')
        .lean() as PopulatedEmployee | null;

      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      // Get attendance policy
      const policy = await AttendancePolicyService.get();

      // Fetch all data in parallel
      const [
        todayAttendance,
        monthlyStats,
        leaveBalance,
        upcomingLeaves,
        myLeaveApplications,
      ] = await Promise.all([
        this.getTodayAttendance(employeeId),
        AttendanceService.getMonthlyStatistics(employeeId, currentMonth, currentYear),
        this.getLeaveBalanceData(employeeId, currentYear),
        this.getUpcomingLeaves(employeeId),
        this.getMyLeaveApplications(employeeId),
      ]);

      // Calculate attendance status
      const attendanceStatus = {
        isCheckedIn: !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime,
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        status: todayAttendance?.status || 'Not Marked',
      };

      // Calculate attendance rate
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
        leaveBalance: leaveBalance.totalRemaining,
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

      // Leave summary
      const leaveSummary = {
        annualLeave: {
          totalAllocation: leaveBalance.annualLeave.totalAllocation,
          used: leaveBalance.annualLeave.used,
          remaining: leaveBalance.annualLeave.remaining,
          pending: leaveBalance.annualLeave.pending,
        },
        sickLeave: {
          totalAllocation: leaveBalance.sickLeave.totalAllocation,
          used: leaveBalance.sickLeave.used,
          remaining: leaveBalance.sickLeave.remaining,
          pending: leaveBalance.sickLeave.pending,
        },
        emergencyLeave: {
          totalAllocation: leaveBalance.emergencyLeave.totalAllocation,
          used: leaveBalance.emergencyLeave.used,
          remaining: leaveBalance.emergencyLeave.remaining,
          pending: leaveBalance.emergencyLeave.pending,
        },
        totalAllocated: leaveBalance.totalAllocated,
        totalUsed: leaveBalance.totalUsed,
        totalRemaining: leaveBalance.totalRemaining,
        totalPending: leaveBalance.totalPending,
      };

      return {
        employeeId: employee.employeeId,
        fullName: employee.userId.fullName,
        position: employee.position || null,
        department: employee.department || null,
        attendanceStatus,
        attendanceRate,
        monthlyOverview,
        workingHours,
        leaveSummary,
        upcomingLeaves,
        myLeaveApplications,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'DashboardService', 
        method: 'getUserDashboard', 
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
        // Return default structure if no balance found
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
        annualLeave: {
          totalAllocation: leaveBalance.annualLeave?.totalAllocation || 0,
          used: leaveBalance.annualLeave?.used || 0,
          remaining: leaveBalance.annualLeave?.remaining || 0,
          pending: pendingAnnual,
        },
        sickLeave: {
          totalAllocation: leaveBalance.sickLeave?.totalAllocation || 0,
          used: leaveBalance.sickLeave?.used || 0,
          remaining: leaveBalance.sickLeave?.remaining || 0,
          pending: pendingSick,
        },
        emergencyLeave: {
          totalAllocation: leaveBalance.emergencyLeave?.totalAllocation || 0,
          used: leaveBalance.emergencyLeave?.used || 0,
          remaining: leaveBalance.emergencyLeave?.remaining || 0,
          pending: pendingEmergency,
        },
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
}
