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
   * Get the single leave policy
   */
  static async get(): Promise<LeavePolicyDocument | null> {
    try {
      const policy = await LeavePolicy.findOne().lean();
      
      return policy as LeavePolicyDocument | null;
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
