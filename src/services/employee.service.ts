import Employee from "../models/employee.model";
import { PaginationService } from "./pagination.service";
import { LeaveBalanceService } from "./leave-balance.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  EmployeeQuery, 
  UpdateEmployeeData 
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
   * Get all employees with pagination and filtering
   */
  static async getAll(query: EmployeeQuery): Promise<any> {
    try {
      const searchableFields = ['employeeId', 'position', 'department'];
      const allowedSortFields = ['employeeId', 'position', 'department', 'joinDate', 'salary', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['department', 'status', 'position'];

      const result = await PaginationService.paginate(Employee, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Manually populate user data for all employees
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

      // Check if joinDate is being added/updated and employee didn't have one before
      const isAddingJoinDate = data.joinDate && !employee.joinDate;

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
          console.log(`Leave balance initialized for employee ${id} for year ${currentYear}`);
        } catch (error: any) {
          // If leave balance already exists, just log it (don't fail the update)
          if (error?.statusCode === 400) {
            console.log(`Leave balance already exists for employee ${id} for year ${currentYear}`);
          } else {
            console.error(`Failed to initialize leave balance for employee ${id}:`, error);
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

      await Employee.findByIdAndDelete(id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'EmployeeService', method: 'delete', id });
    }
  }
}
