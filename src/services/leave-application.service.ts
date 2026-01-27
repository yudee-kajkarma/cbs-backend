import { LeaveApplication, User } from "../models";
import { LeaveBalanceService } from "./leave-balance.service";
import { EmployeeService } from "./employee.service";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { ActivityLogger } from "../utils/activity-logger.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { LeaveApplicationStatus } from "../constants/leave-policy.constants";
import { EmployeeStatus } from "../constants/common.constants";
import { UserRole } from "../constants/user.constants";
import { ActivityType, ActivityModule } from "../constants/activity-log.constants";
import { 
  LeaveApplicationDocument, 
  LeaveApplicationQuery, 
  CreateLeaveApplicationData,
  UpdateLeaveApplicationData
} from "../interfaces/model.interface";

export class LeaveApplicationService {
  
  /**
   * Generate a unique leave request ID
   */
  private static async generateUniqueRequestId(): Promise<string> {
    return ReferenceGenerator.generateLeaveApplicationReference();
  }

  /**
   * Calculate number of days between two dates (inclusive)
   */
  private static calculateDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  }

  /**
   * Validate that the approver has Admin or HR role
   */
  private static async validateApproverRole(approverId: string): Promise<void> {
    const approver = await User.findById(approverId).select('role').lean();
    
    if (!approver) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
    }

    if (approver.role !== UserRole.ADMIN && approver.role !== UserRole.HR) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.UNAUTHORIZED_ACTION);
    }
  }

  /**
   * Create a new leave application
   */
  static async create(data: CreateLeaveApplicationData): Promise<LeaveApplicationDocument> {
    try {
      const employee = await EmployeeService.getById(data.employeeId!.toString());
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const numberOfDays = this.calculateDays(data.startDate!, data.endDate!);

      if (numberOfDays <= 0) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_DATE_RANGE);
      }

      const overlapping = await LeaveApplication.findOne({
        employeeId: data.employeeId,
        status: { $in: [LeaveApplicationStatus.PENDING, LeaveApplicationStatus.APPROVED] },
        $or: [
          {
            startDate: { $lte: data.endDate },
            endDate: { $gte: data.startDate }
          }
        ]
      });

      if (overlapping) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.OVERLAPPING_LEAVE);
      }

      // Check leave balance (for paid leaves)
      if (data.leaveType !== 'Maternity Leave' && data.leaveType !== 'Paternity Leave') {
        const currentYear = new Date(data.startDate!).getFullYear();
        try {
          const leaveBalance = await LeaveBalanceService.getByEmployeeAndYear(
            data.employeeId!.toString(),
            currentYear
          );

          let availableBalance = 0;
          switch (data.leaveType) {
            case 'Annual Leave':
              availableBalance = leaveBalance.annualLeave.remaining;
              break;
            case 'Sick Leave':
              availableBalance = leaveBalance.sickLeave.remaining;
              break;
            case 'Emergency Leave':
              availableBalance = leaveBalance.emergencyLeave.remaining;
              break;
            case 'Unpaid Leave':
              availableBalance = leaveBalance.unpaidLeave.remaining;
              break;
          }

          if (availableBalance < numberOfDays) {
            throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INSUFFICIENT_LEAVE_BALANCE);
          }
        } catch (error: any) {
          // Re-throw if it's not a "not found" error
          if (error?.code === ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_NOT_FOUND.code) {
            throw error;
          }
          throw error;
        }
      }

      // Generate unique request ID
      const requestId = await this.generateUniqueRequestId();

      // Create leave application
      const leaveApplication = await LeaveApplication.create({
        ...data,
        requestId,
        numberOfDays,
        status: LeaveApplicationStatus.PENDING,
        appliedOn: new Date(),
      });

      const populated = await LeaveApplication.findById(leaveApplication._id)
        .populate({
          path: 'employeeId',
          select: 'employeeId position department phoneNumber joinDate status',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        })
        .populate('approvedBy', 'username email role')
        .lean();

      if (!populated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      // Log activity
      const employeeData = populated.employeeId as any;
      const userData = employeeData?.userId as any;
      await ActivityLogger.log({
        userId: employeeData?.userId?._id,
        employeeId: data.employeeId!.toString(),
        type: ActivityType.LEAVE_SUBMIT,
        action: 'Leave application submitted',
        module: ActivityModule.LEAVES,
        entity: { type: 'LeaveApplication', id: populated._id.toString() },
        description: `${userData?.fullName || 'Employee'} submitted ${data.leaveType} for ${numberOfDays} days`,
        metadata: {
          requestId,
          leaveType: data.leaveType,
          numberOfDays,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason
        }
      });

      return populated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'create', data });
    }
  }

  /**
   * Get leave application by ID
   */
  static async getById(id: string): Promise<any> {
    try {
      const leaveApplication = await LeaveApplication.findById(id)
        .populate({
          path: 'employeeId',
          select: 'employeeId position department phoneNumber joinDate status',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        })
        .populate('approvedBy', 'username email role')
        .lean();

      if (!leaveApplication) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      return leaveApplication;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'getById', id });
    }
  }

  /**
   * Get all leave applications with pagination and filtering
   */
  static async getAll(query: LeaveApplicationQuery): Promise<any> {
    try {
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const countFilter: any = {};
      if (query.employeeId) {
        countFilter.employeeId = query.employeeId;
      }

      // Count queries filtered by current year
      const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
        LeaveApplication.countDocuments({ 
          ...countFilter,
          status: LeaveApplicationStatus.PENDING,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
        LeaveApplication.countDocuments({ 
          ...countFilter,
          status: LeaveApplicationStatus.APPROVED,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
        LeaveApplication.countDocuments({ 
          ...countFilter,
          status: LeaveApplicationStatus.REJECTED,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
        LeaveApplication.countDocuments({ 
          ...countFilter,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
      ]);

      const searchableFields = ['requestId', 'reason'];
      const allowedSortFields = ['requestId', 'leaveType', 'startDate', 'endDate', 'status', 'appliedOn', 'createdAt', 'updatedAt'];
      const filterFields = ['status', 'leaveType', 'employeeId'];

      const result = await PaginationService.paginate(LeaveApplication, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      const populatedData = await LeaveApplication.populate(result.data, [
        {
          path: 'employeeId',
          select: 'employeeId position department phoneNumber',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        },
        {
          path: 'approvedBy',
          select: 'username email role',
        }
      ]);

      return {
        summary: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalCount,
        },
        leaveApplications: populatedData,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'getAll', query });
    }
  }

  /**
   * Update leave application by ID (only for pending applications)
   */
  static async update(
    id: string,
    data: UpdateLeaveApplicationData
  ): Promise<any> {
    try {
      const existing = await LeaveApplication.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      if (existing.status !== LeaveApplicationStatus.PENDING) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_CANNOT_MODIFY);
      }

      // If dates are being updated, recalculate numberOfDays
      if (data.startDate || data.endDate) {
        const startDate = data.startDate || existing.startDate;
        const endDate = data.endDate || existing.endDate;
        data.numberOfDays = this.calculateDays(startDate, endDate);
      }

      const updated = await LeaveApplication.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, lean: true }
      );

      const populated = await LeaveApplication.populate(updated, [
        {
          path: 'employeeId',
          select: 'employeeId position department phoneNumber ',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        },
        {
          path: 'approvedBy',
          select: 'username email role',
        }
      ]);

      return populated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'update', id, data });
    }
  }

  /**
   * Delete leave application by ID (only for pending applications)
   */
  static async delete(id: string): Promise<void> {
    try {
      const existing = await LeaveApplication.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      if (existing.status !== LeaveApplicationStatus.PENDING) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_CANNOT_MODIFY);
      }

      await LeaveApplication.findByIdAndDelete(id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'delete', id });
    }
  }

  /**
   * Update leave application status (approve or reject)
   */
  static async updateStatus(
    id: string,
    action: 'approve' | 'reject',
    approvedBy: string,
    rejectionReason?: string
  ): Promise<any> {
    try {
      // Validate that approver has Admin or HR role
      await this.validateApproverRole(approvedBy);

      if (action === 'approve') {
        return await this.approve(id, approvedBy);
      } else if (action === 'reject') {
        if (!rejectionReason || rejectionReason.trim() === '') {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_INPUT);
        }
        return await this.reject(id, approvedBy, rejectionReason);
      } else {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_INPUT);
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'updateStatus', id, action, approvedBy });
    }
  }

  /**
   * Approve leave application (private helper)
   */
  private static async approve(id: string, approvedBy: string): Promise<any> {
    try {
      // Validate that approver has Admin or HR role
      await this.validateApproverRole(approvedBy);

      const existing = await LeaveApplication.findById(id).populate('employeeId');
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      if (existing.status !== LeaveApplicationStatus.PENDING) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_OPERATION);
      }

      // Deduct leave from balance
      const year = new Date(existing.startDate).getFullYear();
      await LeaveBalanceService.deductLeave(
        existing.employeeId._id.toString(),
        year,
        existing.leaveType,
        existing.numberOfDays
      );

      // Update leave application status
      const updated = await LeaveApplication.findByIdAndUpdate(
        id,
        {
          $set: {
            status: LeaveApplicationStatus.APPROVED,
            approvedBy,
            actionDate: new Date(),
          }
        },
        { new: true, lean: true }
      );

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      const populated = await LeaveApplication.populate(updated, [
        {
          path: 'employeeId',
          select: 'employeeId position department phoneNumber ',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        },
        {
          path: 'approvedBy',
          select: 'username email role',
        }
      ]);

      // If leave starts today or has already started, update employee status to "On Leave"
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const leaveStart = new Date(existing.startDate);
      leaveStart.setHours(0, 0, 0, 0);

      if (leaveStart <= today) {
        await EmployeeService.update(existing.employeeId._id.toString(), {
          status: EmployeeStatus.ON_LEAVE
        });
      }

      // Log activity
      await ActivityLogger.log({
        userId: approvedBy,
        employeeId: existing.employeeId._id.toString(),
        type: ActivityType.LEAVE_APPROVE,
        action: 'Approved leave application',
        module: ActivityModule.LEAVES,
        entity: { type: 'leave-application', id: existing._id },
        description: `Leave application ${existing.requestId} approved for ${existing.leaveType}`,
        metadata: {
          requestId: existing.requestId,
          leaveType: existing.leaveType,
          numberOfDays: existing.numberOfDays,
          startDate: existing.startDate,
          endDate: existing.endDate,
          approvedBy
        }
      });

      return populated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'approve', id, approvedBy });
    }
  }

  /**
   * Reject leave application (private helper)
   */
  private static async reject(id: string, approvedBy: string, rejectionReason: string): Promise<any> {
    try {
      // Validate that approver has Admin or HR role
      await this.validateApproverRole(approvedBy);

      const existing = await LeaveApplication.findById(id);
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_APPLICATION_NOT_FOUND);
      }

      if (existing.status !== LeaveApplicationStatus.PENDING) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_OPERATION);
      }

      if (!rejectionReason || rejectionReason.trim() === '') {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_INPUT);
      }

      // Update leave application status
      const updated = await LeaveApplication.findByIdAndUpdate(
        id,
        {
          $set: {
            status: LeaveApplicationStatus.REJECTED,
            approvedBy,
            actionDate: new Date(),
            rejectionReason,
          }
        },
        { new: true, lean: true }
      );

      const populated = await LeaveApplication.populate(updated, [
        {
          path: 'employeeId',
          select: 'employeeId position department phoneNumber joinDate status',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        },
        {
          path: 'approvedBy',
          select: 'username email role',
        }
      ]);

      // Log activity
      await ActivityLogger.log({
        userId: approvedBy,
        employeeId: existing.employeeId.toString(),
        type: ActivityType.LEAVE_REJECT,
        action: 'Rejected leave application',
        module: ActivityModule.LEAVES,
        entity: { type: 'leave-application', id: existing._id },
        description: `Leave application ${existing.requestId} rejected for ${existing.leaveType}`,
        metadata: {
          requestId: existing.requestId,
          leaveType: existing.leaveType,
          numberOfDays: existing.numberOfDays,
          startDate: existing.startDate,
          endDate: existing.endDate,
          rejectionReason,
          approvedBy
        }
      });

      return populated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'reject', id, approvedBy, rejectionReason });
    }
  }

  /**
   * Get employee leave summary with statistics and history
   */
  static async getEmployeeLeaveSummary(employeeId: string, query: LeaveApplicationQuery): Promise<any> {
    try {
      const employee = await EmployeeService.getById(employeeId);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      // Get current year date range
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
        LeaveApplication.countDocuments({ 
          employeeId, 
          status: LeaveApplicationStatus.PENDING,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
        LeaveApplication.countDocuments({ 
          employeeId, 
          status: LeaveApplicationStatus.APPROVED,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
        LeaveApplication.countDocuments({ 
          employeeId, 
          status: LeaveApplicationStatus.REJECTED,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
        LeaveApplication.countDocuments({ 
          employeeId,
          startDate: { $gte: yearStart, $lte: yearEnd }
        }),
      ]);

      const searchableFields: string[] = [];
      const allowedSortFields = ['appliedOn', 'startDate', 'endDate', 'status', 'leaveType'];
      const filterFields = ['employeeId', 'status', 'leaveType', 'startDate', 'endDate'];
      const modifiedQuery = { ...query, employeeId };

      const result = await PaginationService.paginate(LeaveApplication, modifiedQuery, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Populate employee and approver data
      const populatedData = await LeaveApplication.populate(result.data, [
        {
          path: 'employeeId',
          select: 'employeeId position department phoneNumber joinDate status',
          populate: {
            path: 'userId',
            select: 'fullName email username'
          }
        },
        {
          path: 'approvedBy',
          select: 'fullName email username',
        }
      ]);

      return {
        summary: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalCount,
        },
        leaveApplications: populatedData,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeaveApplicationService', method: 'getEmployeeLeaveSummary', employeeId, query });
    }
  }
}
