import { Employee, User, LeavePolicy, AttendancePolicy, PayrollCompensation } from '../models';
import { employeeSchema } from '../models/employee.model';
import { getConnectionByTenantDbName, addActiveConnection } from '../utils/tenant-context';
import { registerAllModelsOnConnection } from '../utils/register-models';
import mongoose from 'mongoose';
import { config } from '../config/config';
import { FileUploadService } from "./file-upload.service";
import { validateS3Keys } from "../utils/aws.util";
import { PaginationService } from "./pagination.service";
import { LeaveBalanceService } from "./leave-balance.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import {
  EmployeeQuery,
  UpdateEmployeeData,
} from "../interfaces/model.interface";

export class EmployeeService {

  /**
   * Get employee by ID with populated user data
   */
  static async getById(id: string): Promise<any> {
    try {
      const employee = await Employee.findById(id)
        .populate('userId', 'userId fullName email role')
        .lean();

      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      return employee;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EmployeeService', method: 'getById', id });
    }
  }

  /**
   * Get employee by user ID (for login - doesn't require tenant context)
   * @param userId - User's MongoDB ObjectId
   * @param tenantRefId - Tenant reference ID
   */
  static async getByUserIdForLogin(userId: string, tenantRefId: string): Promise<any> {
    try {
      // Use connection pooling - reuse existing connection or create new one
      const tenantDbName = `CBS_${tenantRefId}`;
      let tenantConnection = getConnectionByTenantDbName(tenantDbName);
      
      // If no connection exists, create and cache it
      if (!tenantConnection) {
        const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
        const tenantUri = `${baseUri}/${tenantDbName}`;
        tenantConnection = await mongoose.createConnection(tenantUri);
        addActiveConnection(tenantDbName, tenantConnection);
        await registerAllModelsOnConnection(tenantConnection);
      }

      const EmployeeModel = tenantConnection.model('Employee', employeeSchema, 'employees');
      const employee = await EmployeeModel.findOne({ userId })
        .select('employeeId position department phoneNumber joinDate status')
        .lean();

      return employee;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'EmployeeService', 
        method: 'getByUserIdForLogin', 
        userId,
        tenantRefId 
      });
    }
  }

  /**
   * Get employee by user ID
   */
  static async getByUserId(userId: string): Promise<any> {
    try {
      const employee = await Employee.findOne({ userId })
        .select('employeeId position department phoneNumber joinDate status')
        .lean();

      return employee;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EmployeeService', method: 'getByUserId', userId });
    }
  }

  /**
   * Get all employees with pagination and filtering
   * Only returns employees with role='USER' (excludes ADMIN and HR system roles)
   */
  static async getAll(query: EmployeeQuery): Promise<any> {
    try {
      const searchableFields = ['employeeId', 'position', 'department'];
      const allowedSortFields = ['employeeId', 'position', 'department', 'joinDate', 'salary', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['department', 'status', 'position'];

      // Get all user IDs with role='USER' first
      const userDocs = await User.find({ role: 'USER' }).select('_id').lean();
      const userIds = userDocs.map((u: any) => u._id);

      // Add userId filter to only fetch employees linked to role='USER' users
      const additionalFilters = {
        userId: { $in: userIds }
      };

      const result = await PaginationService.paginate(Employee, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
        additionalFilters: additionalFilters,
      });

      // Populate user data for all employees
      const populatedData = await Employee.populate(result.data, {
        path: 'userId',
        select: 'userId fullName email role'
      });

      return {
        employees: populatedData,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EmployeeService', method: 'getAll', query });
    }
  }

  /**
   * Update employee by ID (HR updates employee details)
   */
  static async update(id: string, data: UpdateEmployeeData): Promise<any> {
    try {
      // Check if employee exists
      const employee = await Employee.findById(id);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      // Validate file keys if documents are being updated
      if (data.documents && data.documents.length > 0) {
        const fileKeys = data.documents
          .map(doc => doc.fileKey)
          .filter((key): key is string => key !== undefined && key !== null);
        if (fileKeys.length > 0) {
          await validateS3Keys(fileKeys);
        }
      }

      // Check if joinDate is being added/updated and employee didn't have one before
      const isAddingJoinDate = data.joinDate && !employee.joinDate;

      if(isAddingJoinDate) {
        const activePolicy = await LeavePolicy.findOne().lean();
        if (!activePolicy) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND);
        }

        const attendancePolicy = await AttendancePolicy.findOne().lean();
        if (!attendancePolicy) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_POLICY_NOT_FOUND);
        }

        const payrollCompensation = await PayrollCompensation.findOne().lean();
        if (!payrollCompensation) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYROLL_COMPENSATION_NOT_FOUND);
        }
      }

      const updated = await Employee.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate('userId', 'userId fullName email role')
        .lean();

      // Auto-initialize leave balance when joinDate is added
      if (isAddingJoinDate) {
        const currentYear = new Date().getFullYear();
        try {
          await LeaveBalanceService.initializeForEmployee(id, currentYear);
        } catch (error: any) {
          if (error?.code === ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_BALANCE_EXISTS.code) {
          } else if (error?.code === ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND.code) {
            throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND);
          } else {
            throw error;
          }
        }
      }

      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EmployeeService', method: 'update', id, data });
    }
  }

  /**
   * Delete employee by ID
   */
  static async delete(id: string): Promise<void> {
    try {
      const employee = await Employee.findById(id);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      if (employee.documents && employee.documents.length > 0) {
        const fileKeys = employee.documents.map((doc: any) => doc.fileKey).filter(Boolean);
        if (fileKeys.length > 0) {
          await FileUploadService.deleteFiles(fileKeys);
        }
      }

      await Employee.findByIdAndDelete(id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EmployeeService', method: 'delete', id });
    }
  }
}
