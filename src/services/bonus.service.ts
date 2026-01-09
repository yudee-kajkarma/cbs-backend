import EmployeeBonus from "../models/employeeBonus.model";
import { EmployeeService } from "./employee.service";
import { PaginationService } from "./pagination.service";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { ActivityLogger } from "../utils/activity-logger.util";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { ActivityType, ActivityModule } from "../constants/activity-log.constants";
import {
  EmployeeBonusDocument,
  EmployeeBonusQuery,
  CreateEmployeeBonusData,
  UpdateEmployeeBonusData,
} from "../interfaces/model.interface";

export class BonusService {

  /**
   * Create a new bonus
   */
  static async create(data: CreateEmployeeBonusData): Promise<EmployeeBonusDocument> {
    try {
      const employee = await EmployeeService.getById(data.employeeId.toString());
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const bonusId = await ReferenceGenerator.generateBonusReference(data.month, data.year);

      // Create bonus record
      const bonus = await EmployeeBonus.create({
        ...data,
        bonusId,
      });

      const result = await this.getById(bonus._id.toString());

      // Log activity
      const employeeData = result.employeeId as any;
      const userData = employeeData?.userId as any;
      await ActivityLogger.log({
        userId: employeeData?.userId?._id,
        employeeId: data.employeeId!.toString(),
        type: ActivityType.BONUS_CREATE,
        action: 'Bonus created',
        module: ActivityModule.PAYROLL,
        entity: { type: 'EmployeeBonus', id: bonus._id.toString() },
        description: `Bonus created for ${userData?.fullName || 'employee'}`,
        metadata: {
          bonusId,
          amount: data.amount,
          month: data.month,
          year: data.year
        }
      });

      return result;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'BonusService', 
        method: 'create', 
        data 
      });
    }
  }

  /**
   * Get bonus by ID with populated employee data
   */
  static async getById(id: string): Promise<any> {
    try {
      const bonus = await EmployeeBonus.findById(id)
        .populate({
          path: 'employeeId',
          select: 'employeeId position department',
          populate: {
            path: 'userId',
            select: 'fullName email'
          }
        })
        .lean();

      if (!bonus) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BONUS_NOT_FOUND);
      }

      return bonus;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'BonusService', 
        method: 'getById', 
        id 
      });
    }
  }

  /**
   * Get all bonuses with pagination and filtering
   */
  static async getAll(query: EmployeeBonusQuery): Promise<any> {
    try {
      const searchableFields = ['bonusId'];
      const allowedSortFields = ['bonusId', 'amount', 'month', 'year', 'createdAt'];
      const filterFields = ['month', 'year', 'employeeId'];

      const result = await PaginationService.paginate(EmployeeBonus, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Populate employee data
      const populatedData = await EmployeeBonus.populate(result.data, {
        path: 'employeeId',
        select: 'employeeId position department',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      });

      // Calculate total bonus amount for filtered results
      const totalAmount = populatedData.reduce((sum, bonus) => sum + bonus.amount, 0);

      return {
        bonuses: populatedData,
        totalAmount,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'BonusService', 
        method: 'getAll', 
        query 
      });
    }
  }

  /**
   * Update bonus by ID
   */
  static async update(id: string, data: UpdateEmployeeBonusData): Promise<any> {
    try {
      const bonus = await EmployeeBonus.findById(id);
      if (!bonus) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BONUS_NOT_FOUND);
      }

      const updated = await EmployeeBonus.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      return await this.getById(updated!._id.toString());
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'BonusService', 
        method: 'update', 
        id, 
        data 
      });
    }
  }

  /**
   * Delete bonus by ID
   */
  static async delete(id: string): Promise<void> {
    try {
      const bonus = await EmployeeBonus.findById(id);
      if (!bonus) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BONUS_NOT_FOUND);
      }

      await EmployeeBonus.findByIdAndDelete(id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'BonusService', 
        method: 'delete', 
        id 
      });
    }
  }

  /**
   * Get total bonuses for a specific month/year
   */
  static async getTotalByPeriod(month: number, year: number): Promise<number> {
    try {
      const bonuses = await EmployeeBonus.find({ month, year }).lean();
      return bonuses.reduce((sum, b) => sum + b.amount, 0);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'BonusService', 
        method: 'getTotalByPeriod', 
        month, 
        year 
      });
    }
  }
}
