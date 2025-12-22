import { Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";
import { EmployeeResponseDto, GetAllEmployeesResponseDto } from "../dtos/employee-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class EmployeeController {
  /**
   * Get employee by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await EmployeeService.getById(id);
      const employeeDto = toDto(EmployeeResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.EMPLOYEE.RETRIEVED_SUCCESSFULLY, employeeDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all employees with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await EmployeeService.getAll(query);

      const employeesDto = toDtoList(EmployeeResponseDto, result.employees);

      const responseData: GetAllEmployeesResponseDto = {
        employees: employeesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.EMPLOYEE.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Update employee by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await EmployeeService.update(id, req.body);
      const employeeDto = toDto(EmployeeResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.EMPLOYEE.UPDATED_SUCCESSFULLY, employeeDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete employee by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await EmployeeService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.EMPLOYEE.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }
}
