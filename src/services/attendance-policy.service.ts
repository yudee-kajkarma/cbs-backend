import { AttendancePolicy } from "../models";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  AttendancePolicyDocument,
  UpdateAttendancePolicyData
} from "../interfaces/model.interface";

export class AttendancePolicyService {
  
  /**
   * Get the single attendance policy
   */
  static async get(): Promise<AttendancePolicyDocument | null> {
    try {
      const policy = await AttendancePolicy.findOne().lean();
      
      return policy as AttendancePolicyDocument | null;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AttendancePolicyService', method: 'get' });
    }
  }

  /**
   * Update the single attendance policy (upsert: creates if doesn't exist, updates if exists)
   */
  static async update(data: UpdateAttendancePolicyData): Promise<AttendancePolicyDocument> {
    try {
      // Use findOneAndUpdate with upsert to create if not exists, update if exists
      const updated = await AttendancePolicy.findOneAndUpdate(
        {}, // Empty filter - find any document (singleton pattern)
        { $set: data },
        { 
          new: true, 
          lean: true,
          upsert: true, // Create if doesn't exist
          setDefaultsOnInsert: true // Apply schema defaults when creating
        }
      );

      return updated as AttendancePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AttendancePolicyService', method: 'update', data });
    }
  }
}
