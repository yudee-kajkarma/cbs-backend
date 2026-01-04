import { UserService } from './user.service';
import { RoleService } from './role.service';
import { JwtUtil, UserJwtPayload } from '../utils/jwt.util';
import { throwError, isCustomError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { INFO_MESSAGES } from '../constants/info-messages.constants';
import { PermissionManager } from '../constants/permission.constants';
import { SYSTEM_ROLES } from '../constants/enums.constants';
import { UserDocument } from '../interfaces/model.interface';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import Employee from '../models/employee.model';

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
    username: string;
    fullName: string;
    email: string;
    role: string;
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
   * @param credentials - Login credentials (username/email and password)
   * @returns Login response with token and user info
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { username, password } = credentials;

      // Find user by username or email
      const user = await UserService.findByUsernameOrEmail(username);

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_CREDENTIALS);
      }

      // Find employee details if user has employee record
      const employee = await Employee.findOne({ userId: user._id })
        .select('employeeId position department phoneNumber joinDate status')
        .lean();

      // Generate JWT token with permissions and employee data
      const token = await this.generateUserToken(
        user, 
        employee ? employee._id.toString() : null
      );

      return {
        token,
        user: {
          id: user._id.toString(),
          userId: user.userId || '',
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
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
   * @param user - User document
   * @param employeeId - Optional employee ID
   * @returns JWT token string
   */
  static async generateUserToken(
    user: UserDocument,
    employeeId?: string | null
  ): Promise<string> {
    // Get permissions based on user role
    const permissions = await this.getUserPermissionsForToken(user);

    // Build JWT payload
    const payload: Omit<UserJwtPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      employee: employeeId ? {
        id: employeeId,
      } : null,
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

