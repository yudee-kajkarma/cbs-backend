import Role, { RoleDocument } from "../models/role.model";
import { Types } from "mongoose";
import {
  PermissionManager,
  PERMISSIONS,
} from "../constants/permission.constants";
import { SYSTEM_ROLES } from "../constants/enums.constants";
import { throwError, isCustomError } from "../utils/errors.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { ErrorHandler } from "../utils/error-handler.util";
import { PaginationService } from "./pagination.service";
import {
  CreateDefaultRolesRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleQueryParams,
  RoleWithPermissions,
  CreateRole,
} from "../interfaces/role.interface";

export class RoleService {
  /**
   * Find role by ID
   */
  static async findRoleByRoleId(roleId: Types.ObjectId): Promise<RoleDocument> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ROLE_NOT_FOUND);
    }
    return role;
  }

  /**
   * Check for duplicate role name
   */
  static async checkDuplicateRoleName(
    name: string,
    excludeRoleId?: Types.ObjectId
  ): Promise<void> {
    const query: any = { name, isActive: true };
    if (excludeRoleId) {
      query._id = { $ne: excludeRoleId };
    }

    const existingRole = await Role.findOne(query);
    if (existingRole) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ROLE_NAME_ALREADY_EXISTS);
    }
  }

  /**
   * Create default system roles (used for custom permission roles for USER role)
   * Note: ADMIN and HR roles get full access via middleware, not via role documents
   */
  static async createDefaultRoles({
    createdBy,
  }: CreateDefaultRolesRequest): Promise<{
    readOnlyRole: RoleWithPermissions;
  }> {
    const existingRoles = await Role.find({
      name: "READ_ONLY",
      isSystemRole: true,
    });

    if (existingRoles.length > 0) {
      throw throwError(
        ERROR_MESSAGES.CLIENT_ERRORS.DEFAULT_ROLES_ALREADY_EXIST
      );
    }

    // Only create READ_ONLY role for assigning to USER role users
    const savedReadOnlyRole = await this.saveRole({
      name: "READ_ONLY",
      description: "Read-only access (can be assigned to USER role)",
      createdBy: createdBy || null,
      isSystemRole: true,
      permissions: PermissionManager.buildSystemRolePermissions(
        SYSTEM_ROLES.USER
      ), // Empty for USER role
    });

    return {
      readOnlyRole: savedReadOnlyRole.toObject() as RoleWithPermissions,
    };
  }

  /**
   * Create custom role (for USER role permissions)
   */
  static async createCustomRole(
    roleData: CreateRoleRequest
  ): Promise<RoleWithPermissions> {
    await this.checkDuplicateRoleName(roleData.name);

    // Validate permissions
    PermissionManager.validatePermissions(roleData.permissions);

    const savedRole = await this.saveRole({
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      createdBy: roleData.createdBy || null,
      isSystemRole: false,
    });

    const roleObject = savedRole.toObject() as RoleWithPermissions;
    // Get permissions for display (normalized and mapped)
    const permissions = await this.getRolePermissions(savedRole._id);

    return {
      ...roleObject,
      permissions,
    };
  }

  /**
   * Update role
   */
  static async updateRole(
    roleId: Types.ObjectId,
    updateData: UpdateRoleRequest,
    _updatedBy: Types.ObjectId
  ): Promise<RoleWithPermissions> {
    const role = await this.validateAndGetRoleById(roleId);

    if (updateData.name && updateData.name !== role.name) {
      await this.checkDuplicateRoleName(updateData.name, roleId);
    }

    if (updateData.permissions) {
      PermissionManager.validatePermissions(updateData.permissions);
    }

    Object.assign(role, updateData);
    const updatedRole = await role.save();

    const roleObject = updatedRole.toObject() as RoleWithPermissions;
    // Get permissions for display
    const permissions = await this.getRolePermissions(updatedRole._id);

    return {
      ...roleObject,
      permissions,
    };
  }

  /**
   * Delete role (soft delete)
   */
  static async deleteRole(
    roleId: Types.ObjectId,
    _deletedBy: Types.ObjectId
  ): Promise<void> {
    const role = await this.validateAndGetRoleById(roleId);

    role.isActive = false;
    await role.save();
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: string): Promise<RoleWithPermissions> {
    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(roleId)) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ROLE_NOT_FOUND);
    }

    const role = await Role.findOne({
      _id: new Types.ObjectId(roleId),
      isActive: true,
    }).lean();

    if (!role) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ROLE_NOT_FOUND);
    }

    // Get permissions for display
    const permissions = await this.getRolePermissions(role._id);

    return {
      ...role,
      permissions,
    } as RoleWithPermissions;
  }

  /**
   * Get all roles with pagination and filtering
   */
  static async getRoles(
    queryParams: RoleQueryParams
  ): Promise<{ roles: RoleWithPermissions[] }> {
    const { isSystemRole, isActive = true } = queryParams;

    const filter: any = {};
    if (isSystemRole !== undefined) filter.isSystemRole = isSystemRole;
    if (isActive !== undefined) filter.isActive = isActive;

    const roles = await Role.find(filter).lean().sort({ createdAt: -1 });

    // Get permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const permissions = await this.getRolePermissions(role._id);

        return {
          ...role,
          permissions,
        };
      })
    );

    return {
      roles: rolesWithPermissions as RoleWithPermissions[],
    };
  }

  /**
   * Get all roles with pagination
   */
  static async getAllRoles(query: RoleQueryParams): Promise<any> {
    try {
      const searchableFields = ["name", "description"];
      const allowedSortFields = [
        "name",
        "isSystemRole",
        "isActive",
        "createdAt",
        "updatedAt",
      ];
      const filterFields = ["isSystemRole", "isActive"];

      const result = await PaginationService.paginate(Role, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      // Get permissions for each role
      const rolesWithPermissions = await Promise.all(
        result.data.map(async (role: any) => {
          const permissions = await this.getRolePermissions(role._id);

          return {
            ...role,
            permissions,
          };
        })
      );

      return {
        roles: rolesWithPermissions,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "RoleService",
        method: "getAllRoles",
        query,
      });
    }
  }

  /**
   * Validate and get role by ID (prevents system role modification)
   */
  private static async validateAndGetRoleById(
    roleId: Types.ObjectId
  ): Promise<RoleDocument> {
    const role = await this.findRoleByRoleId(roleId);
    if (role?.isSystemRole) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.CANNOT_MODIFY_SYSTEM_ROLE);
    }
    return role;
  }

  /**
   * Get user's effective permissions from custom roles (for USER role only)
   * ADMIN and HR roles get full access via middleware, so this method is
   * only called for USER role users to resolve their custom permissions.
   *
   * @param userRoles - Array of Role document IDs assigned to the user
   * @returns Combined permissions from all assigned roles using bitwise OR
   */
  static async getUserEffectivePermissions(
    userRoles: Types.ObjectId[]
  ): Promise<Record<string, Record<string, number>>> {
    // If no roles assigned, return empty permissions
    if (!userRoles || userRoles.length === 0) {
      return {};
    }

    // Fetch all assigned roles
    const roles = await Role.find({
      _id: { $in: userRoles },
      isActive: true,
    });

    // If no active roles found, return empty permissions
    if (roles.length === 0) {
      return {};
    }

    // Extract permissions from each role
    const rolePermissions = roles.map(
      (role) =>
        (role.permissions ?? {}) as Record<string, Record<string, number>>
    );

    // Merge all permissions using bitwise OR
    let allPermissions =
      PermissionManager.buildRolePermissions(rolePermissions);

    // Normalize permissions: expand WRITE (4) to include READ (2) = 6
    allPermissions = PermissionManager.normalizePermissions(allPermissions);

    return allPermissions;
  }

  /**
   * Get permissions from a single role (for display purposes)
   */
  static async getRolePermissions(
    roleId: Types.ObjectId
  ): Promise<Record<string, Record<string, number>>> {
    const role = await Role.findOne({
      _id: roleId,
      isActive: true,
    });

    if (!role) {
      return {};
    }

    let permissions = (role.permissions ?? {}) as Record<
      string,
      Record<string, number>
    >;

    // Normalize permissions
    permissions = PermissionManager.normalizePermissions(permissions);

    // Map labels to names for display
    return PermissionManager.mapLabelsToNames(permissions);
  }

  /**
   * Save role (private helper)
   */
  private static async saveRole(roleData: CreateRole): Promise<RoleDocument> {
    // Skip permission validation for system roles as they use generated permissions
    if (!roleData.isSystemRole) {
      PermissionManager.validatePermissions(roleData.permissions);
    }

    const role = this.createRole(roleData);
    return role.save();
  }

  /**
   * Create role instance (private helper)
   */
  private static createRole(params: CreateRole): RoleDocument {
    const { name, description, createdBy, permissions, isSystemRole } = params;
    return new Role({
      name,
      description,
      permissions: permissions || {},
      isSystemRole: isSystemRole ?? false,
      isActive: true,
      createdBy,
    });
  }
}
