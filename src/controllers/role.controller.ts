import { Request, Response } from "express";
import { RoleService } from "../services/role.service";
import {
  RoleResponseDto,
  GetAllRolesResponseDto,
  DefaultRolesResponseDto,
} from "../dtos/role-dto";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";
import { Types } from "mongoose";

export class RoleController {
  /**
   * Create default system roles
   * Note: ADMIN and HR roles get full access via middleware, no need for role documents
   * This creates a READ_ONLY role for assigning to USER role users
   */
  static async createDefaultRoles(req: Request, res: Response): Promise<void> {
    try {
      const createdBy = req.body.createdBy
        ? new Types.ObjectId(req.body.createdBy)
        : undefined;
      const result = await RoleService.createDefaultRoles({ createdBy });

      const readOnlyRoleDto = toDto(RoleResponseDto, result.readOnlyRole);

      const response = ResponseUtil.success(
        INFO_MESSAGES.ROLE.DEFAULT_ROLES_CREATED_SUCCESSFULLY,
        { readOnlyRole: readOnlyRoleDto }
      );
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: "createDefaultRoles",
        data: req.body,
      });
    }
  }

  /**
   * Create a new custom role
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const roleData = {
        ...req.body,
        createdBy: req.body.createdBy
          ? new Types.ObjectId(req.body.createdBy)
          : undefined,
      };
      const result = await RoleService.createCustomRole(roleData);
      const roleDto = toDto(RoleResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ROLE.CREATED_SUCCESSFULLY,
        roleDto
      );
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: "create",
        data: req.body,
      });
    }
  }

  /**
   * Get role by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await RoleService.getRoleById(id);
      const roleDto = toDto(RoleResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ROLE.RETRIEVED_SUCCESSFULLY,
        roleDto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: "getById",
        id: req.params.id,
      });
    }
  }

  /**
   * Get all roles with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await RoleService.getAllRoles(query);

      const rolesDto = toDtoList(RoleResponseDto, result.roles);

      const responseData: GetAllRolesResponseDto = {
        roles: rolesDto,
        pagination: result.pagination,
        filters: result.filters,
      };

      const response = ResponseUtil.success(
        INFO_MESSAGES.ROLE.LIST_RETRIEVED_SUCCESSFULLY,
        responseData
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: "getAll",
        query: req.query,
      });
    }
  }

  /**
   * Update role by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedBy = req.body.updatedBy
        ? new Types.ObjectId(req.body.updatedBy)
        : new Types.ObjectId();
      const result = await RoleService.updateRole(
        new Types.ObjectId(id),
        req.body,
        updatedBy
      );
      const roleDto = toDto(RoleResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ROLE.UPDATED_SUCCESSFULLY,
        roleDto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: "update",
        id: req.params.id,
        data: req.body,
      });
    }
  }

  /**
   * Delete role by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedBy = req.body.deletedBy
        ? new Types.ObjectId(req.body.deletedBy)
        : new Types.ObjectId();
      await RoleService.deleteRole(new Types.ObjectId(id), deletedBy);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ROLE.DELETED_SUCCESSFULLY,
        null
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: "delete",
        id: req.params.id,
      });
    }
  }
}
