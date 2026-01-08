import EmployeeIncentive from "../models/employeeIncentive.model";
import Employee from "../models/employee.model";
import { PaginationService } from "./pagination.service";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import {
  EmployeeIncentiveDocument,
  EmployeeIncentiveQuery,
  CreateEmployeeIncentiveData,
  UpdateEmployeeIncentiveData,
} from "../interfaces/model.interface";

export class IncentiveService {

  /**
   * Create a new incentive
   */
  static async create(data: CreateEmployeeIncentiveData): Promise<EmployeeIncentiveDocument> {
    try {
      const employee = await Employee.findById(data.employeeId);
      if (!employee) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const incentiveId = await ReferenceGenerator.generateIncentiveReference(data.month, data.year);

      const incentive = await EmployeeIncentive.create({
        ...data,
        incentiveId,
      });

      return await this.getById(incentive._id.toString());
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'IncentiveService', 
        method: 'create', 
        data 
      });
    }
  }

  /**
   * Get incentive by ID with populated employee data
   */
  static async getById(id: string): Promise<any> {
    try {
      const incentive = await EmployeeIncentive.findById(id)
        .populate({
          path: 'employeeId',
          select: 'employeeId position department',
          populate: {
            path: 'userId',
            select: 'fullName email'
          }
        })
        .lean();

      if (!incentive) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INCENTIVE_NOT_FOUND);
      }

      return incentive;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'IncentiveService', 
        method: 'getById', 
        id 
      });
    }
  }

  /**
   * Get all incentives with pagination and filtering
   */
  static async getAll(query: EmployeeIncentiveQuery): Promise<any> {
    try {
      const searchableFields = ['incentiveId', 'description'];
      const allowedSortFields = ['incentiveId', 'amount', 'month', 'year', 'createdAt'];
      const filterFields = ['month', 'year', 'employeeId'];

      const result = await PaginationService.paginate(EmployeeIncentive, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Populate employee data
      const populatedData = await EmployeeIncentive.populate(result.data, {
        path: 'employeeId',
        select: 'employeeId position department',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      });

      const totalAmount = populatedData.reduce((sum, incentive) => sum + incentive.amount, 0);

      return {
        incentives: populatedData,
        totalAmount,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'IncentiveService', 
        method: 'getAll', 
        query 
      });
    }
  }

  /**
   * Update incentive by ID
   */
  static async update(id: string, data: UpdateEmployeeIncentiveData): Promise<any> {
    try {
      const incentive = await EmployeeIncentive.findById(id);
      if (!incentive) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INCENTIVE_NOT_FOUND);
      }

      const updated = await EmployeeIncentive.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      return await this.getById(updated!._id.toString());
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'IncentiveService', 
        method: 'update', 
        id, 
        data 
      });
    }
  }

  /**
   * Delete incentive by ID
   */
  static async delete(id: string): Promise<void> {
    try {
      const incentive = await EmployeeIncentive.findById(id);
      if (!incentive) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INCENTIVE_NOT_FOUND);
      }

      await EmployeeIncentive.findByIdAndDelete(id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'IncentiveService', 
        method: 'delete', 
        id 
      });
    }
  }

  /**
   * Get total incentives for a specific month/year
   */
  static async getTotalByPeriod(month: number, year: number): Promise<number> {
    try {
      const incentives = await EmployeeIncentive.find({ month, year }).lean();
      return incentives.reduce((sum, i) => sum + i.amount, 0);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'IncentiveService', 
        method: 'getTotalByPeriod', 
        month, 
        year 
      });
    }
  }
}
