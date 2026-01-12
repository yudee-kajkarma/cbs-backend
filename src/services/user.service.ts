import { User, Employee } from "../models";
import { getTenantModel as getAdminTenantModel } from "../utils/admin-connection";
import { getIdentityUserModel } from "../utils/admin-connection";
import { getTenantContext, getConnectionByTenantDbName, addActiveConnection } from "../utils/tenant-context";
import { registerAllModelsOnConnection } from "../utils/register-models";
import { userSchema } from "../models/user.model";
import { config } from "../config/config";
import mongoose from "mongoose";
import { PaginationService } from "./pagination.service";
import { throwError, isCustomError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { RoleService } from "./role.service";
import {
  UserDocument,
  UserQuery,
  CreateUserData,
  UpdateUserData,
} from "../interfaces/model.interface";
import { Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import { PermissionManager } from "../constants/permission.constants";
import { SYSTEM_ROLES } from "../constants/enums.constants";

export class UserService {
  /**
   * Generate globally unique userRefId
   * Format: USER-{timestamp}{random}
   */
  private static generateUserRefId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `USER-${timestamp}${random}`;
  }

  /**
   * Generate a unique user ID with format based on role
   */
  private static async generateUniqueUserId(role: string): Promise<string> {
    return ReferenceGenerator.generateUserReference(role);
  }

  /**
   * Calculate user's effective permissions based on role
   * Replicates AuthService.getUserPermissionsForToken logic
   * @param user - User object with role and roles fields
   * @returns Complete permissions with NONE for missing features
   */
  private static async calculateUserEffectivePermissions(
    user: any
  ): Promise<Record<string, Record<string, number>>> {
    // ADMIN and HR get full system permissions with explicit NONE for restricted features
    if (user.role === SYSTEM_ROLES.ADMIN || user.role === SYSTEM_ROLES.HR) {
      return PermissionManager.buildSystemRolePermissions(user.role);
    }

    // USER role gets permissions from assigned roles
    let userPermissions: Record<string, Record<string, number>> = {};

    if (user.roles && user.roles.length > 0) {
      const roleIds = user.roles.map((role: any) => {
        // Handle three cases: ObjectId, populated object, or string ID
        if (role instanceof Types.ObjectId) {
          return role;
        } else if (role._id) {
          // Role is a populated object, extract _id
          return role._id instanceof Types.ObjectId
            ? role._id
            : new Types.ObjectId(role._id);
        } else {
          // Role is a string ID
          return new Types.ObjectId(role);
        }
      });
      userPermissions = await RoleService.getUserEffectivePermissions(roleIds);
    }

    // Build complete permissions with NONE for missing features
    return PermissionManager.buildCompletePermissions(userPermissions);
  }

  /**
   * Create employee record for user
   */
  private static async createEmployeeForUser(userId: any): Promise<void> {
    try {
      const existingEmployee = await Employee.findOne({ userId });
      if (!existingEmployee) {
        const employeeId = await ReferenceGenerator.generateEmployeeReference();

        await Employee.create({
          userId,
          employeeId,
          status: "Active",
        });
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "createEmployeeForUser",
        context: "employee auto-creation",
        userId,
      });
    }
  }

  /**
   * Create a new user (dual-write to identity_db and tenant DB)
   */
  static async create(data: CreateUserData): Promise<UserDocument> {
    try {
      // Step 1: Validate required fields for identity
      if (!data.username || !data.email || !data.password) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_INPUT);
      }

      // Step 2: Check global username uniqueness in identity_db
      const IdentityUserModel = await getIdentityUserModel();
      const existingUsername = await IdentityUserModel.findOne({ username: data.username });
      if (existingUsername) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_USERNAME_EXISTS);
      }

      // Step 3: Check global email uniqueness in identity_db
      const existingEmail = await IdentityUserModel.findOne({ email: data.email });
      if (existingEmail) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_EMAIL_EXISTS);
      }

      // Step 4: Validate role is provided
      if (!data.role) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_INPUT);
      }

      // Step 5: Get tenant context
      const tenantContext = getTenantContext();
      const tenantRefId = tenantContext.tenantId;

      // Step 6: Generate unique userRefId (globally unique) and userId (role-based)
      const userRefId = this.generateUserRefId(); // e.g., "USER-173652341234512345"
      const userId = await this.generateUniqueUserId(data.role); // e.g., "HR-001"

      // Step 7: Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Step 8: Create user in CBS_Admin.users (credentials)
      const identityUser = await IdentityUserModel.create({
        userRefId,
        tenantRefId,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        isActive: true,
      });

      // Step 9: Create user in tenant DB (business data)
      const tenantUser = await User.create({
        userId,
        userRefId,
        tenantRefId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        roles: data.roles || [],
      });

      // Step 10: Auto-create employee record
      await this.createEmployeeForUser(tenantUser._id);

      return tenantUser.toObject();
    } catch (error) {
      // TODO: Implement compensating transaction if tenant user creation fails
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "create",
        data,
      });
    }
  }

  /**
   * Find tenant user by userRefId (for login after identity verification)
   * @param userRefId - User reference ID from identity_db
   * @param tenantRefId - Tenant reference ID
   * @returns User document from tenant database
   */
  static async findByUserRefId(userRefId: string, tenantRefId: string): Promise<UserDocument> {
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
      
      const UserModel = tenantConnection.model('User', userSchema, 'users');
      const user = await UserModel.findOne({ userRefId });

      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      return user.toObject() as UserDocument;
    } catch (error) {
      if (isCustomError(error)) {
        throw error;
      }
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "findByUserRefId",
        userRefId,
        tenantRefId
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<any> {
    try {
      const user = await User.findById(id).populate("roles").lean();

      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      // Calculate effective permissions
      const permissions = await this.calculateUserEffectivePermissions(user);

      return {
        ...user,
        permissions,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "getById",
        id,
      });
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  static async getAll(query: UserQuery): Promise<any> {
    try {
      const searchableFields = ["fullName", "email", "username", "userId"];
      const allowedSortFields = [
        "fullName",
        "email",
        "username",
        "role",
        "userId",
        "createdAt",
        "updatedAt",
      ];
      const filterFields = ["role"];

      const result = await PaginationService.paginate(User, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
        populateOptions: [{ path: "roles" }],
      });

      // Calculate permissions for each user
      const usersWithPermissions = await Promise.all(
        result.data.map(async (user: any) => {
          const permissions = await this.calculateUserEffectivePermissions(
            user
          );

          return {
            ...user,
            permissions,
          };
        })
      );

      return {
        users: usersWithPermissions,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "getAll",
        query,
      });
    }
  }

  /**
   * Update user (dual-update to identity_db and tenant DB)
   */
  static async update(id: string, data: UpdateUserData): Promise<any> {
    try {
      // Step 1: Check if tenant user exists
      const tenantUser = await User.findById(id);
      if (!tenantUser) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      const IdentityUserModel = await getIdentityUserModel();

      // Step 2: Find identity user by userRefId
      const identityUser = await IdentityUserModel.findOne({ userRefId: tenantUser.userRefId });
      if (!identityUser) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      // Step 3: Handle credential updates (identity_db)
      const identityUpdates: any = {};
      
      if (data.username && data.username !== identityUser.username) {
        // Check global username uniqueness
        const existingUsername = await IdentityUserModel.findOne({ username: data.username });
        if (existingUsername && existingUsername.userRefId !== tenantUser.userRefId) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_USERNAME_EXISTS);
        }
        identityUpdates.username = data.username;
      }

      if (data.email && data.email !== identityUser.email) {
        // Check global email uniqueness
        const existingEmail = await IdentityUserModel.findOne({ email: data.email });
        if (existingEmail && existingEmail.userRefId !== tenantUser.userRefId) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_EMAIL_EXISTS);
        }
        identityUpdates.email = data.email;
      }

      if (data.password) {
        identityUpdates.password = await bcrypt.hash(data.password, 10);
      }

      // Step 4: Update identity_db if there are credential changes
      if (Object.keys(identityUpdates).length > 0) {
        await IdentityUserModel.findOneAndUpdate(
          { userRefId: tenantUser.userRefId },
          { $set: identityUpdates },
          { new: true, runValidators: true }
        );
      }

      // Step 5: Handle business data updates (tenant DB)
      const tenantUpdates: any = {};
      if (data.fullName) tenantUpdates.fullName = data.fullName;
      if (data.role) tenantUpdates.role = data.role;
      if (data.roles !== undefined) tenantUpdates.roles = data.roles;

      // Step 6: Update tenant DB
      const updatedTenantUser = await User.findByIdAndUpdate(
        id,
        { $set: tenantUpdates },
        { new: true, runValidators: true }
      ).lean();

      return updatedTenantUser;
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "update",
        id,
        data,
      });
    }
  }

  /**
   * Delete user (dual-delete from identity_db and tenant DB)
   */
  static async delete(id: string): Promise<void> {
    try {
      // Step 1: Check if tenant user exists
      const tenantUser = await User.findById(id);
      if (!tenantUser) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      // Step 2: Delete from identity_db
      const IdentityUserModel = await getIdentityUserModel();
      await IdentityUserModel.findOneAndDelete({ userRefId: tenantUser.userRefId });

      // Step 3: Delete from tenant DB
      await User.findByIdAndDelete(id);

      // Note: Employee records are cascade-deleted or handled separately
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "delete",
        id,
      });
    }
  }

  /**
   * Assign roles to user
   */
  static async assignRoles(userId: string, roleIds: string[]): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      // Validate all role IDs are valid ObjectIds
      const validRoleIds = roleIds.map((id) => {
        if (!Types.ObjectId.isValid(id)) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_ID);
        }
        return new Types.ObjectId(id);
      });

      user.roles = validRoleIds;
      const updated = await user.save();

      return updated.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "assignRoles",
        userId,
        roleIds,
      });
    }
  }

  /**
   * Get user's effective permissions
   */
  static async getUserPermissions(
    userId: string
  ): Promise<Record<string, Record<string, number>>> {
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      if (!user.roles || user.roles.length === 0) {
        return {};
      }

      const roleIds = user.roles.map((role: any) => new Types.ObjectId(role));
      return await RoleService.getUserEffectivePermissions(roleIds);
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "getUserPermissions",
        userId,
      });
    }
  }

  /**
   * Check if username exists in identity database
   * @param username - Username to check
   * @returns True if username exists, false otherwise
   */
  static async checkUsernameExistsInIdentity(username: string): Promise<boolean> {
    try {
      const IdentityUserModel = await getIdentityUserModel();
      const existingUser = await IdentityUserModel.findOne({ username });
      return !!existingUser;
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "checkUsernameExistsInIdentity",
        username,
      });
    }
  }

  /**
   * Check if email exists in identity database
   * @param email - Email to check
   * @returns True if email exists, false otherwise
   */
  static async checkEmailExistsInIdentity(email: string): Promise<boolean> {
    try {
      const IdentityUserModel = await getIdentityUserModel();
      const existingUser = await IdentityUserModel.findOne({ email });
      return !!existingUser;
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: "UserService",
        method: "checkEmailExistsInIdentity",
        email,
      });
    }
  }
}
