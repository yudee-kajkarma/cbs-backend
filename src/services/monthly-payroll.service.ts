import MonthlyPayroll from "../models/monthlyPayroll.model";
import Employee from "../models/employee.model";
import Attendance from "../models/attendance.model";
import EmployeeBonus from "../models/employeeBonus.model";
import EmployeeIncentive from "../models/employeeIncentive.model";
import PayrollCompensation from "../models/payrollCompensation.model";
import { AttendancePolicyService } from "./attendance-policy.service";
import { PaginationService } from "./pagination.service";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { AttendanceUtil } from "../utils/attendance.util";
import { ActivityLogger } from "../utils/activity-logger.util";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { MonthlyPayrollStatus } from "../constants/monthly-payroll.constants";
import { AttendanceStatus } from "../constants/attendance.constants";
import { LeaveApplicationStatus } from "../constants/leave-policy.constants";
import { ActivityType, ActivityModule } from "../constants/activity-log.constants";
import LeaveApplication from "../models/leaveApplication.model";
import {
  MonthlyPayrollDocument,
  MonthlyPayrollQuery,
  UpdateMonthlyPayrollData,
} from "../interfaces/model.interface";

export class MonthlyPayrollService {

  /**
   * Update or create monthly payroll for an employee (for daily cron job)
   * If payroll exists and status is Pending, it recalculates and updates
   * If payroll exists and status is Processed or Paid, it skips the update
   */
  static async updateOrCreatePayroll(employeeId: string, month: number, year: number): Promise<{ action: 'created' | 'updated' | 'skipped', payroll?: any, reason?: string }> {
    try {
      const existing = await MonthlyPayroll.findOne({ employeeId, month, year }).lean();

      // Skip if payroll is already Processed or Paid 
      if (existing && (existing.status === MonthlyPayrollStatus.PROCESSED || existing.status === MonthlyPayrollStatus.PAID)) {
        return {
          action: 'skipped',
          reason: `Payroll already ${existing.status}`,
        };
      }

      // Get employee details
      const employee = await Employee.findById(employeeId).lean();
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      if (!employee.salary || employee.salary === 0) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_SALARY_NOT_SET);
      }

      // Get attendance policy 
      const policy = await AttendancePolicyService.get();
      
      // Get payroll compensation settings
      const payrollConfig = await PayrollCompensation.findOne().lean();
      if (!payrollConfig) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYROLL_COMPENSATION_NOT_FOUND);
      }
      const socialInsuranceRate = payrollConfig.socialInsuranceRate || 10;

      // Calculate month date range
      const startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      // Determine the effective end date for calculation
      // If current date is within the month, use today; otherwise use month end
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const effectiveEndDate = (today >= startDate && today <= endDate) ? today : endDate;
      effectiveEndDate.setHours(23, 59, 59, 999);

      // Calculate working days up to effective date 
      const workingDaysTillToday = AttendanceUtil.getWorkingDaysInRange(startDate, effectiveEndDate, policy);

      // Calculate total working days in entire month 
      const workingDays = AttendanceUtil.getWorkingDaysInMonth(month, year, policy);

      // Get attendance records for the month up to effective date
      const attendanceRecords = await Attendance.find({
        employeeId,
        date: { $gte: startDate, $lte: effectiveEndDate }
      }).lean();

      // Get ALL approved leave applications (not just unpaid)
      const allLeaveApps = await LeaveApplication.find({
        employeeId,
        status: LeaveApplicationStatus.APPROVED,
        startDate: { $lte: effectiveEndDate },
        endDate: { $gte: startDate }
      }).lean();

      // Calculate unpaid leave days up to effective date
      let unpaidLeaveDays = 0;
      let paidLeaveDays = 0;
      
      allLeaveApps.forEach(leave => {
        const leaveStart = leave.startDate > startDate ? leave.startDate : startDate;
        const leaveEnd = leave.endDate < effectiveEndDate ? leave.endDate : effectiveEndDate;
        const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (leave.leaveType === 'Unpaid Leave') {
          unpaidLeaveDays += days;
        } else {
          // Paid leaves (Emergency, Sick, Annual, etc.) - count as present
          paidLeaveDays += days;
        }
      });

      // Count present and absent days (only for elapsed days)
      const presentDays = attendanceRecords.filter(a => 
        a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
      ).length;
      
      // Absent = working days till today - present - paid leaves - unpaid leaves
      const absentDays = Math.max(0, workingDaysTillToday - presentDays - paidLeaveDays - unpaidLeaveDays);

      // Calculate attendance percentage (based on elapsed days, paid leaves NOT counted as present)
      const attendancePercentage = workingDaysTillToday > 0 ? (presentDays / workingDaysTillToday) * 100 : 0;

      // Calculate salary components
      const totalSalary = employee.salary;
      const basicSalary = employee.salary; // For now, basic = total

      // Calculate total working days in entire month (for daily salary rate)
      const totalWorkingDaysInMonth = AttendanceUtil.getWorkingDaysInMonth(month, year, policy);

      // Daily salary based on FULL month working days, not elapsed days
      const dailySalary = totalWorkingDaysInMonth > 0 ? totalSalary / totalWorkingDaysInMonth : 0;
      const salaryDeduction = (absentDays + unpaidLeaveDays) * dailySalary;

      // Calculate social insurance deduction
      const socialInsurance = (totalSalary * socialInsuranceRate) / 100;

      // Calculate overtime pay
      let overtimePay = 0;
      if (totalWorkingDaysInMonth > 0) {
        attendanceRecords.forEach(record => {
          if (record.overtimeHours > 0) {
            const hourlyRate = totalSalary / (totalWorkingDaysInMonth * policy.standardHoursPerDay);
            overtimePay += record.overtimeHours * hourlyRate * policy.overtimeRateMultiplier;
          }
        });
      }

      // Get bonuses for this month
      const bonuses = await EmployeeBonus.find({ employeeId, month, year }).lean();
      const bonusAmount = bonuses.reduce((sum, b) => sum + b.amount, 0);

      // Get incentives for this month
      const incentives = await EmployeeIncentive.find({ employeeId, month, year }).lean();
      const incentiveAmount = incentives.reduce((sum, i) => sum + i.amount, 0);

      // Calculate total deductions and net salary
      const totalDeductions = salaryDeduction + socialInsurance;
      const netSalary = Math.max(0, totalSalary - totalDeductions + bonusAmount + incentiveAmount + overtimePay);

      // Prepare payroll data
      const payrollData: any = {
        employeeId,
        month,
        year,
        totalSalary,
        basicSalary,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        workingDays,
        presentDays: presentDays,
        absentDays,
        unpaidLeaveDays,
        paidLeaveDays,
        salaryDeduction: Math.round(salaryDeduction * 100) / 100,
        socialInsurance: Math.round(socialInsurance * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        bonusAmount: Math.round(bonusAmount * 100) / 100,
        incentiveAmount: Math.round(incentiveAmount * 100) / 100,
        overtimePay: Math.round(overtimePay * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        status: MonthlyPayrollStatus.PENDING,
      };

      let payroll: any;
      let action: 'created' | 'updated';

      if (existing) {
        payroll = await MonthlyPayroll.findOneAndUpdate(
          { employeeId, month, year, status: MonthlyPayrollStatus.PENDING },
          { $set: payrollData },
          { new: true, runValidators: true }
        );
        action = 'updated';

        const result = await this.getById(payroll._id.toString());

        return { action, payroll: result };
      } else {
        const payrollId = await ReferenceGenerator.generateMonthlyPayrollReference(month, year);
        payrollData.payrollId = payrollId;

        payroll = await MonthlyPayroll.create(payrollData);
        action = 'created';

        const result = await this.getById(payroll._id.toString());

        // Log activity for creation
        const employeeData = result.employeeId as any;
        const userData = employeeData?.userId as any;
        await ActivityLogger.log({
          userId: employeeData?.userId?._id,
          employeeId,
          type: ActivityType.PAYROLL_CREATE,
          action: 'Payroll generated',
          module: ActivityModule.PAYROLL,
          entity: { type: 'MonthlyPayroll', id: payroll._id.toString() },
          description: `Monthly payroll generated for ${userData?.fullName || 'employee'} for ${month}/${year}`,
          metadata: {
            payrollId: result.payrollId,
            month,
            year,
            netSalary: result.netSalary,
            attendancePercentage: result.attendancePercentage,
            presentDays: presentDays,
            absentDays
          }
        });

        return { action, payroll: result };
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'updateOrCreatePayroll', 
        employeeId, 
        month, 
        year 
      });
    }
  }

  /**
   * Recalculate or create payroll for all active employees (manual trigger)
   * Same logic as daily cron job but can be triggered manually
   */
  static async recalculateAllEmployees(month: number, year: number): Promise<any> {
    try {
      const activeEmployees = await Employee.find({
        status: { $in: ['Active', 'On Leave'] }
      });

      let createdCount = 0;
      let updatedCount = 0;
      let skipCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      for (const employee of activeEmployees) {
        try {
          if (!employee.salary || employee.salary === 0) {
            skipCount++;
            continue;
          }

          const result = await this.updateOrCreatePayroll(
            employee._id.toString(),
            month,
            year
          );
          
          if (result.action === 'created') {
            createdCount++;
          } else if (result.action === 'updated') {
            updatedCount++;
          } else if (result.action === 'skipped') {
            skipCount++;
          }
        } catch (error: any) {
          errorCount++;
          errors.push({
            employeeId: employee._id.toString(),
            error: error?.message || 'Unknown error'
          });
        }
      }

      return {
        month,
        year,
        totalEmployees: activeEmployees.length,
        createdCount,
        updatedCount,
        skipCount,
        errorCount,
        errors: errorCount > 0 ? errors : undefined
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'recalculateAllEmployees', 
        month, 
        year 
      });
    }
  }

  /**
   * Get payroll by ID with populated employee data
   */
  static async getById(id: string): Promise<any> {
    try {
      const payroll = await MonthlyPayroll.findById(id)
        .populate({
          path: 'employeeId',
          select: 'employeeId position department',
          populate: {
            path: 'userId',
            select: 'fullName email'
          }
        })
        .lean();

      if (!payroll) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.MONTHLY_PAYROLL_NOT_FOUND);
      }

      return payroll;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'getById', 
        id 
      });
    }
  }

  /**
   * Get all payrolls with pagination and filtering
   */
  static async getAll(query: MonthlyPayrollQuery): Promise<any> {
    try {
      const searchableFields = ['payrollId'];
      const allowedSortFields = ['payrollId', 'month', 'year', 'netSalary', 'status', 'createdAt'];
      const filterFields = ['status', 'month', 'year', 'employeeId'];

      const result = await PaginationService.paginate(MonthlyPayroll, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Populate employee data
      const populatedData = await MonthlyPayroll.populate(result.data, {
        path: 'employeeId',
        select: 'employeeId position department',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      });

      return {
        payrolls: populatedData,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'getAll', 
        query 
      });
    }
  }

  /**
   * Process all pending payrolls for a given month/year
   */
  static async processAllPending(month: number, year: number): Promise<any> {
    try {
      const result = await MonthlyPayroll.updateMany(
        { 
          month, 
          year, 
          status: MonthlyPayrollStatus.PENDING 
        },
        { 
          $set: { 
            status: MonthlyPayrollStatus.PROCESSED,
            processedDate: new Date()
          } 
        }
      );

      return {
        processedCount: result.modifiedCount,
        month,
        year
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'processAllPending', 
        month, 
        year 
      });
    }
  }

  /**
   * Update payroll status (handles status transitions only)
   */
  static async update(id: string, data: UpdateMonthlyPayrollData): Promise<any> {
    try {
      const payroll = await MonthlyPayroll.findById(id);
      if (!payroll) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.MONTHLY_PAYROLL_NOT_FOUND);
      }

      // Prevent updating if already paid
      if (payroll.status === MonthlyPayrollStatus.PAID) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.MONTHLY_PAYROLL_ALREADY_PAID);
      }

      const updateData: any = { status: data.status };

      if (data.status === MonthlyPayrollStatus.PROCESSED && payroll.status === MonthlyPayrollStatus.PENDING) {
        updateData.processedDate = new Date();
      } else if (data.status === MonthlyPayrollStatus.PAID) {
        updateData.paidDate = new Date();
        if (payroll.status === MonthlyPayrollStatus.PENDING) {
          updateData.processedDate = new Date();
        }
      }

      const updated = await MonthlyPayroll.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return await this.getById(updated!._id.toString());
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'update', 
        id, 
        data 
      });
    }
  }

  /**
   * Get payroll statistics for a specific month and year
   */
  static async getStatistics(month: number, year: number): Promise<any> {
    try {
      const payrolls = await MonthlyPayroll.find({ month, year }).lean();

      const totalEmployees = payrolls.length;
      const grossPayroll = payrolls.reduce((sum, p) => sum + p.totalSalary, 0);
      const totalDeductions = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
      const netPayable = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

      return {
        month,
        year,
        totalEmployees,
        grossPayroll: Math.round(grossPayroll * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netPayable: Math.round(netPayable * 100) / 100
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'getStatistics', 
        month, 
        year 
      });
    }
  }

  /**
   * Export payroll report for a specific month and year as CSV
   */
  static async exportReport(month: number, year: number): Promise<string> {
    try {
      const payrolls = await MonthlyPayroll.find({ month, year })
        .populate({
          path: 'employeeId',
          select: 'employeeId position department',
          populate: {
            path: 'userId',
            select: 'fullName email'
          }
        })
        .sort({ createdAt: -1 })
        .lean();

      if (payrolls.length === 0) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.MONTHLY_PAYROLL_NOT_FOUND);
      }

      // CSV Headers
      const headers = [
        ,'Employee ID', 'Employee Name', 'Email', 'Position', 'Department',
        'Month', 'Year', 'Total Salary', 'Basic Salary', 'Working Days', 'Present Days',
        'Absent Days', 'Unpaid Leave Days', 'Attendance %', 'Salary Deduction',
        'Social Insurance', 'Total Deductions', 'Bonus Amount', 'Incentive Amount',
        'Overtime Pay', 'Net Salary', 'Status', 'Processed Date', 'Paid Date'
      ];

      const rows = payrolls.map((p: any) => [
        p.employeeId?.employeeId || '',
        `"${p.employeeId?.userId?.fullName || ''}"`,
        p.employeeId?.userId?.email || '',
        `"${p.employeeId?.position || ''}"`,
        `"${p.employeeId?.department || ''}"`,
        p.month,
        p.year,
        p.totalSalary,
        p.basicSalary,
        p.workingDays,
        p.presentDays,
        p.absentDays,
        p.unpaidLeaveDays,
        p.attendancePercentage,
        p.salaryDeduction,
        p.socialInsurance,
        p.totalDeductions,
        p.bonusAmount,
        p.incentiveAmount,
        p.overtimePay,
        p.netSalary,
        p.status,
        p.processedDate ? new Date(p.processedDate).toISOString().split('T')[0] : '',
        p.paidDate ? new Date(p.paidDate).toISOString().split('T')[0] : ''
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return csv;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'MonthlyPayrollService', 
        method: 'exportReport', 
        month, 
        year 
      });
    }
  }
}
