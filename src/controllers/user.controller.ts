import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UserResponseDto, GetAllUsersResponseDto, AdminListResponseDto } from "../dtos/user-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";

export class UserController {
  /**
   * Create a new user
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await UserService.create(req.body);
      const userDto = toDto(UserResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.USER.CREATED_SUCCESSFULLY, userDto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get user by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await UserService.getById(id);
      const userDto = toDto(UserResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.USER.RETRIEVED_SUCCESSFULLY, userDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await UserService.getAll(query);

      const usersDto = toDtoList(UserResponseDto, result.users);

      const responseData: GetAllUsersResponseDto = {
        users: usersDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(INFO_MESSAGES.USER.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }


  /**   * Get all admin users with pagination and filtering
   */

  static async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await UserService.getAllAdmins(query);

      const adminsDto = toDtoList(AdminListResponseDto, result);

      const response = ResponseUtil.success(INFO_MESSAGES.USER.LIST_RETRIEVED_SUCCESSFULLY, adminsDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAllAdmins', query: req.query });
    }
  }

  /**
   * Update user by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await UserService.update(id, req.body);
      const userDto = toDto(UserResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.USER.UPDATED_SUCCESSFULLY, userDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete user by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.delete(id);
      const response = ResponseUtil.success(INFO_MESSAGES.USER.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }

  /**
   * Assign roles to user
   */
  static async assignRoles(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { roleIds } = req.body;
      const result = await UserService.assignRoles(id, roleIds);
      const userDto = toDto(UserResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.USER.ROLES_ASSIGNED_SUCCESSFULLY, userDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'assignRoles', id: req.params.id, data: req.body });
    }
  }
}
