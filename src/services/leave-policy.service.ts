import { LeavePolicy } from "../models";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  LeavePolicyDocument,
  UpdateLeavePolicyData
} from "../interfaces/model.interface";

export class LeavePolicyService {
  
  /**
   * Create leave policy 
   */
  static async create(data: UpdateLeavePolicyData): Promise<LeavePolicyDocument> {
    try {
      const existingPolicy = await LeavePolicy.findOne();
      
      if (existingPolicy) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_EXISTS);
      }

      const policy = await LeavePolicy.create(data);
      return policy.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeavePolicyService', method: 'create', data });
    }
  }

  /**
   * Get the single leave policy
   */
  static async get(): Promise<LeavePolicyDocument> {
    try {
      const policy = await LeavePolicy.findOne().lean();
      
      if (!policy) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND);
      }
      if (!policy) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND);
      }
      
      return policy as LeavePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeavePolicyService', method: 'get' });
    }
  }

  /**
   * Update the single leave policy (upsert: creates if doesn't exist, updates if exists)
   */
  static async update(data: UpdateLeavePolicyData): Promise<LeavePolicyDocument> {
    try {
      // Use findOneAndUpdate with upsert to create if not exists, update if exists
      const updated = await LeavePolicy.findOneAndUpdate(
        {}, // Empty filter - find any document (singleton pattern)
        { $set: data },
        { 
          new: true, 
          lean: true,
          upsert: true, // Create if doesn't exist
          setDefaultsOnInsert: true // Apply schema defaults when creating
        }
      );

      return updated as LeavePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeavePolicyService', method: 'update', data });
    }
  }
}
