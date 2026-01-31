import { UserService } from './user.service';
import { RoleService } from './role.service';
import { EmployeeService } from './employee.service';
import { JwtUtil, UserJwtPayload } from '../utils/jwt.util';
import { throwError, isCustomError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { PermissionManager } from '../constants/permission.constants';
import { SYSTEM_ROLES } from '../constants/enums.constants';
import { UserRole } from '../constants/user.constants';
import { UserDocument, IdentityUserDocument } from '../interfaces/model.interface';
import { getIdentityUserModel } from '../utils/admin-connection';
import { setTenantContext, getConnectionByTenantDbName, addActiveConnection } from '../utils/tenant-context';
import { registerAllModelsOnConnection } from '../utils/register-models';
import { config } from '../config/config';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

/**
 * Login request interface
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    userId: string;
    userRefId: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    tenantRefId: string;
    employee?: {
      id: string;
      position: string;
      department: string;
    } | null;
  };
}

/**
 * Authentication Service
 * Handles user authentication and token generation
 */
export class AuthService {
  /**
   * Authenticate user and generate JWT token
   * Uses CBS_Admin.users for fast O(1) login lookup
   * @param credentials - Login credentials (username/email and password)
   * @returns Login response with token and user info
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { username, password } = credentials;

      // Step 1: Find user in CBS_Admin.users (single query - O(1))
      const IdentityUserModel = await getIdentityUserModel();
      const identityUser = await IdentityUserModel.findOne({
        $or: [{ username }, { email: username.toLowerCase() }],
      });

      if (!identityUser) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_CREDENTIALS);
      }

      // Step 2: Validate password
      const isPasswordValid = await bcrypt.compare(password, identityUser.password);
      if (!isPasswordValid) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_CREDENTIALS);
      }

      // Step 3: Check if user is active
      if (!identityUser.isActive) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_INACTIVE);
      }

      // Step 4: Check if this is a super admin (tenantRefId = "SYSTEM")
      if (identityUser.tenantRefId === 'SYSTEM') {
        // Super admin login - no tenant user record needed
        identityUser.lastLoginAt = new Date();
        await identityUser.save();

        const token = await this.generateSuperAdminToken(identityUser);

        return {
          token,
          user: {
            id: identityUser._id.toString(),
            userId: '', // Super admins don't have userId
            userRefId: identityUser.userRefId,
            username: identityUser.username,
            fullName: identityUser.username, // Use username as fallback
            email: identityUser.email,
            role: SYSTEM_ROLES.SUPER_ADMIN,
            tenantRefId: 'SYSTEM',
            employee: null,
          },
        };
      }

      // Step 5: Get tenant user data from CBS_{tenantRefId} database (regular users)
      const tenantUser = await UserService.findByUserRefId(identityUser.userRefId, identityUser.tenantRefId);

      // Step 6: Find employee details if user has employee record
      const employee = await EmployeeService.getByUserIdForLogin(
        tenantUser._id.toString(),
        identityUser.tenantRefId
      );

      // Step 6.1: Check if USER role has join date
      if (tenantUser.role === UserRole.USER && employee && !employee.joinDate) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_MISSING_JOIN_DATE);
      }

      // Step 7: Update last login time in CBS_Admin.users
      identityUser.lastLoginAt = new Date();
      await identityUser.save();

      // Step 8: Generate JWT token with permissions and employee data
      const token = await this.generateUserToken(
        identityUser,
        tenantUser,
        employee ? employee._id.toString() : null
      );

      return {
        token,
        user: {
          id: tenantUser._id.toString(),
          userId: tenantUser.userId || '',
          userRefId: identityUser.userRefId,
          username: identityUser.username,
          fullName: tenantUser.fullName,
          email: identityUser.email,
          role: tenantUser.role,
          tenantRefId: identityUser.tenantRefId,
          employee: employee ? {
            id: employee._id.toString(),
            position: employee.position!,
            department: employee.department!,
          } : null,
        },
      };
    } catch (error) {
      if (isCustomError(error)) {
        throw error;
      }
      ErrorHandler.handleServiceError(error, {
        serviceName: 'AuthService',
        method: 'login',
        username: credentials.username,
      });
    }
  }

  /**
   * Generate JWT token with user permissions
   * @param identityUser - Identity user document from CBS_Admin.users
   * @param tenantUser - Tenant user document from CBS_{tenantRefId}
   * @param employeeId - Optional employee ID
   * @returns JWT token string
   */
  static async generateUserToken(
    identityUser: IdentityUserDocument,
    tenantUser: UserDocument,
    employeeId?: string | null
  ): Promise<string> {
    // Establish tenant context to fetch permissions
    const tenantRefId = identityUser.tenantRefId;
    const tenantDbName = `CBS_${tenantRefId}`;
    
    // Get or create connection to tenant database
    let tenantConnection = getConnectionByTenantDbName(tenantDbName);
    
    if (!tenantConnection) {
      const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
      const tenantUri = `${baseUri}/${tenantDbName}`;
      tenantConnection = mongoose.createConnection(tenantUri);
      addActiveConnection(tenantDbName, tenantConnection);
      await registerAllModelsOnConnection(tenantConnection);
    }

    // Get permissions within tenant context
    let permissions: Record<string, Record<string, number>>;
    
    await new Promise<void>((resolve) => {
      setTenantContext(tenantRefId, tenantDbName, tenantConnection!, async () => {
        permissions = await this.getUserPermissionsForToken(tenantUser);
        resolve();
      });
    });

    // Build JWT payload
    const payload: Omit<UserJwtPayload, 'iat' | 'exp'> = {
      userId: tenantUser._id.toString(),
      userRefId: identityUser.userRefId,
      tenantRefId: identityUser.tenantRefId,
      username: identityUser.username,
      fullName: tenantUser.fullName,
      role: tenantUser.role,
      employee: employeeId ? {
        id: employeeId,
      } : null,
      permissions: permissions!,
    };

    return JwtUtil.generateToken(payload);
  }

  /**
   * Generate JWT token for super admin
   * @param identityUser - Identity user document from CBS_Admin.users
   * @returns JWT token string
   */
  static async generateSuperAdminToken(
    identityUser: IdentityUserDocument
  ): Promise<string> {
    // Super admins get full permissions across all modules
    const permissions = PermissionManager.buildSystemRolePermissions(SYSTEM_ROLES.SUPER_ADMIN);

    // Build JWT payload for super admin
    const payload: Omit<UserJwtPayload, 'iat' | 'exp'> = {
      userId: identityUser._id.toString(),
      userRefId: identityUser.userRefId,
      tenantRefId: 'SYSTEM',
      username: identityUser.username,
      fullName: identityUser.username, // Super admins don't have fullName in tenant DB
      role: SYSTEM_ROLES.SUPER_ADMIN,
      employee: null,
      permissions,
    };

    return JwtUtil.generateToken(payload);
  }

  /**
   * Get user permissions for JWT token
   * ADMIN and HR get full permissions with explicit NONE for restricted features
   * USER role gets permissions from assigned roles with explicit NONE for missing features
   * @param user - User document
   * @returns Permissions object with all modules and features
   */
  private static async getUserPermissionsForToken(
    user: UserDocument
  ): Promise<Record<string, Record<string, number>>> {
    // ADMIN and HR get full system permissions with explicit NONE for restricted features
    if (user.role === SYSTEM_ROLES.ADMIN || user.role === SYSTEM_ROLES.HR) {
      return PermissionManager.buildSystemRolePermissions(user.role);
    }

    // USER role gets permissions from assigned roles
    let userPermissions: Record<string, Record<string, number>> = {};
    
    if (user.roles && user.roles.length > 0) {
      const roleIds = user.roles.map((role: any) => 
        role instanceof Types.ObjectId ? role : new Types.ObjectId(role)
      );
      userPermissions = await RoleService.getUserEffectivePermissions(roleIds);
    }

    // Build complete permissions with NONE for missing features
    return PermissionManager.buildCompletePermissions(userPermissions);
  }
}

