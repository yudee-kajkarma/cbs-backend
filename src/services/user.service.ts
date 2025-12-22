import User from "../models/user.model";
import Employee from "../models/employee.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { ReferenceGenerator } from "../utils/reference-generator.util";
import { 
  UserDocument, 
  UserQuery, 
  CreateUserData, 
  UpdateUserData 
} from "../interfaces/model.interface";
import * as bcrypt from "bcryptjs";

export class UserService {
  
  /**
   * Generate a unique user ID with format based on role
   */
  private static async generateUniqueUserId(role: string): Promise<string> {
    return ReferenceGenerator.generateUserReference(role);
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
          status: 'Active'
        });
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, {
        serviceName: 'UserService',
        method: 'createEmployeeForUser',
        context: 'employee auto-creation',
        userId
      });
    }
  }

  /**
   * Create a new user
   */
  static async create(data: CreateUserData): Promise<UserDocument> {
    try {
      // Check if email already exists
      const existingEmail = await User.findOne({ email: data.email });
      if (existingEmail) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_EMAIL_EXISTS);
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username: data.username });
      if (existingUsername) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_USERNAME_EXISTS);
      }

      // Validate role is provided
      if (!data.role) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_INPUT);
      }

      // Generate unique userId
      const userId = await this.generateUniqueUserId(data.role);

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(data.password!, 10);

      // Create user
      const user = await User.create({
        ...data,
        userId,
        password: hashedPassword,
      });

      // Auto-create employee record
      await this.createEmployeeForUser(user._id);

      return user.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'UserService', method: 'create', data });
    }
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<any> {
    try {
      const user = await User.findById(id).lean();

      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'UserService', method: 'getById', id });
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  static async getAll(query: UserQuery): Promise<any> {
    try {
      const searchableFields = ['fullName', 'email', 'username', 'userId'];
      const allowedSortFields = ['fullName', 'email', 'username', 'role', 'userId', 'createdAt', 'updatedAt'];
      const filterFields = ['role'];

      const result = await PaginationService.paginate(User, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        users: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'UserService', method: 'getAll', query });
    }
  }

  /**
   * Update user by ID
   */
  static async update(id: string, data: UpdateUserData): Promise<any> {
    try {
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== user.email) {
        const existingEmail = await User.findOne({ email: data.email });
        if (existingEmail) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_EMAIL_EXISTS);
        }
      }

      // Check username uniqueness if username is being updated
      if (data.username && data.username !== user.username) {
        const existingUsername = await User.findOne({ username: data.username });
        if (existingUsername) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_USERNAME_EXISTS);
        }
      }

      // Hash password if being updated
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const updated = await User.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'UserService', method: 'update', id, data });
    }
  }

  /**
   * Delete user by ID
   */
  static async delete(id: string): Promise<void> {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.USER_NOT_FOUND);
      }

      await User.findByIdAndDelete(id);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'UserService', method: 'delete', id });
    }
  }
}
