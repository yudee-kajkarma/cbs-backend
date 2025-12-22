import LeaveBalance from "../models/leaveBalance.model";
import LeavePolicy from "../models/leavePolicy.model";
import Employee from "../models/employee.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  LeaveBalanceDocument, 
  LeaveBalanceQuery,
  UpdateLeaveBalanceData
} from "../interfaces/model.interface";

export class LeaveBalanceService {
  
  /**
   * Calculate remaining leave days
   */
  private static calculateRemaining(data: any): any {
    return {
      ...data,
      annualLeave: {
        ...data.annualLeave,
        remaining: data.annualLeave.totalAllocation - data.annualLeave.used
      },
      sickLeave: {
        ...data.sickLeave,
        remaining: data.sickLeave.totalAllocation - data.sickLeave.used
      },
      emergencyLeave: {
        ...data.emergencyLeave,
        remaining: data.emergencyLeave.totalAllocation - data.emergencyLeave.used
      },
      unpaidLeave: {
        ...data.unpaidLeave,
        remaining: data.unpaidLeave.totalAllowed - data.unpaidLeave.used
      }
    };
  }

  /**
   * Initialize leave balance for an employee based on active leave policy
   */
  static async initializeForEmployee(employeeId: string, year: number): Promise<LeaveBalanceDocument> {
    try {
      const existingBalance = await LeaveBalance.findOne({ employeeId, year });
      
      if (existingBalance) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_EXISTS);
      }

      const activePolicy = await LeavePolicy.findOne().lean();
      
      if (!activePolicy) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND);
      }

      // Create leave balance based on active policy
      const leaveBalanceData = this.calculateRemaining({
        employeeId,
        year,
        annualLeave: {
          totalAllocation: activePolicy.annualLeavePaid,
          used: 0,
        },
        sickLeave: {
          totalAllocation: activePolicy.sickLeavePaid,
          used: 0,
        },
        emergencyLeave: {
          totalAllocation: activePolicy.emergencyLeave,
          used: 0,
        },
        unpaidLeave: {
          totalAllowed: activePolicy.unpaidLeaveMax,
          used: 0,
        },
      });

      const leaveBalance = await LeaveBalance.create(leaveBalanceData);
      return leaveBalance.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'initializeForEmployee', employeeId, year });
    }
  }

  /**
   * Get leave balance by employee ID and year
   */
  static async getByEmployeeAndYear(employeeId: string, year: number): Promise<any> {
    try {
      const leaveBalance = await LeaveBalance.findOne({ employeeId, year })
        .populate('employeeId', 'employeeId firstName lastName email')
        .lean();

      if (!leaveBalance) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_NOT_FOUND);
      }

      return leaveBalance;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'getByEmployeeAndYear', employeeId, year });
    }
  }

  /**
   * Get all leave balances with pagination and filtering
   */
  static async getAll(query: LeaveBalanceQuery): Promise<any> {
    try {
      const searchableFields: string[] = [];
      const allowedSortFields = ['year', 'createdAt', 'updatedAt'];
      const filterFields = ['employeeId', 'year'];

      const result = await PaginationService.paginate(LeaveBalance, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Manually populate employee data after pagination
      const populatedData = await LeaveBalance.populate(result.data, {
        path: 'employeeId',
        select: 'employeeId firstName lastName email',
      });

      return {
        leaveBalances: populatedData,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'getAll', query });
    }
  }

  /**
   * Update leave balance by employee ID and year
   */
  static async updateByEmployeeAndYear(
    employeeId: string,
    year: number,
    data: UpdateLeaveBalanceData
  ): Promise<any> {
    try {
      const existing = await LeaveBalance.findOne({ employeeId, year });
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_NOT_FOUND);
      }

      // Calculate remaining days before update
      const updateData = {
        ...data,
        ...(data.annualLeave && {
          annualLeave: {
            ...data.annualLeave,
            remaining: (data.annualLeave.totalAllocation ?? existing.annualLeave.totalAllocation) - 
                      (data.annualLeave.used ?? existing.annualLeave.used)
          }
        }),
        ...(data.sickLeave && {
          sickLeave: {
            ...data.sickLeave,
            remaining: (data.sickLeave.totalAllocation ?? existing.sickLeave.totalAllocation) - 
                      (data.sickLeave.used ?? existing.sickLeave.used)
          }
        }),
        ...(data.emergencyLeave && {
          emergencyLeave: {
            ...data.emergencyLeave,
            remaining: (data.emergencyLeave.totalAllocation ?? existing.emergencyLeave.totalAllocation) - 
                      (data.emergencyLeave.used ?? existing.emergencyLeave.used)
          }
        }),
        ...(data.unpaidLeave && {
          unpaidLeave: {
            ...data.unpaidLeave,
            remaining: (data.unpaidLeave.totalAllowed ?? existing.unpaidLeave.totalAllowed) - 
                      (data.unpaidLeave.used ?? existing.unpaidLeave.used)
          }
        }),
      };

      // Update the leave balance
      const updated = await LeaveBalance.findByIdAndUpdate(
        existing._id,
        { $set: updateData },
        { new: true, lean: true }
      );

      const populated = await LeaveBalance.populate(updated, {
        path: 'employeeId',
        select: 'employeeId firstName lastName email',
      });

      return populated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'updateByEmployeeAndYear', employeeId, year, data });
    }
  }

  /**
   * Delete leave balance by employee ID and year
   */
  static async deleteByEmployeeAndYear(employeeId: string, year: number): Promise<void> {
    try {
      const existing = await LeaveBalance.findOne({ employeeId, year });
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_NOT_FOUND);
      }

      await LeaveBalance.findByIdAndDelete(existing._id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'deleteByEmployeeAndYear', employeeId, year });
    }
  }

  /**
   * Deduct leave from balance
   */
  static async deductLeave(
    employeeId: string,
    year: number,
    leaveType: string,
    days: number
  ): Promise<void> {
    try {
      const leaveBalance = await LeaveBalance.findOne({ employeeId, year });
      
      if (!leaveBalance) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_NOT_FOUND);
      }

      // Map leave type to balance field
      let balanceField: string;
      switch (leaveType) {
        case 'Annual Leave':
          balanceField = 'annualLeave';
          break;
        case 'Sick Leave':
          balanceField = 'sickLeave';
          break;
        case 'Emergency Leave':
          balanceField = 'emergencyLeave';
          break;
        case 'Unpaid Leave':
          balanceField = 'unpaidLeave';
          break;
        default:
          return;
      }

      // Check if sufficient balance exists
      const currentBalance = (leaveBalance as any)[balanceField];
      if (currentBalance.remaining < days) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INSUFFICIENT_LEAVE_BALANCE);
      }

      await LeaveBalance.findByIdAndUpdate(leaveBalance._id, {
        $inc: {
          [`${balanceField}.used`]: days,
          [`${balanceField}.remaining`]: -days,
        },
      });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'deductLeave', employeeId, year, leaveType, days });
    }
  }

  /**
   * Restore leave to balance (when leave is cancelled/rejected)
   */
  static async restoreLeave(
    employeeId: string,
    year: number,
    leaveType: string,
    days: number
  ): Promise<void> {
    try {
      const leaveBalance = await LeaveBalance.findOne({ employeeId, year });
      
      if (!leaveBalance) {
        return; 
      }

      let balanceField: string;
      switch (leaveType) {
        case 'Annual Leave':
          balanceField = 'annualLeave';
          break;
        case 'Sick Leave':
          balanceField = 'sickLeave';
          break;
        case 'Emergency Leave':
          balanceField = 'emergencyLeave';
          break;
        case 'Unpaid Leave':
          balanceField = 'unpaidLeave';
          break;
        default:
          return;
      }

      await LeaveBalance.findByIdAndUpdate(leaveBalance._id, {
        $inc: {
          [`${balanceField}.used`]: -days,
          [`${balanceField}.remaining`]: days,
        },
      });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveBalanceService', method: 'restoreLeave', employeeId, year, leaveType, days });
    }
  }
}
