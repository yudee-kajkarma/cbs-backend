import AttendancePolicy from "../models/attendancePolicy.model";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  AttendancePolicyDocument,
  UpdateAttendancePolicyData
} from "../interfaces/model.interface";

export class AttendancePolicyService {
  
  /**
   * Create attendance policy 
   */
  static async create(data: UpdateAttendancePolicyData): Promise<AttendancePolicyDocument> {
    try {
      const existingPolicy = await AttendancePolicy.findOne();
      
      if (existingPolicy) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_POLICY_EXISTS);
      }

      const policy = await AttendancePolicy.create(data);
      return policy.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AttendancePolicyService', method: 'create', data });
    }
  }

  /**
   * Get the single attendance policy
   */
  static async get(): Promise<AttendancePolicyDocument> {
    try {
      const policy = await AttendancePolicy.findOne().lean();
      
      if (!policy) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_POLICY_NOT_FOUND);
      }
      
      return policy as AttendancePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AttendancePolicyService', method: 'get' });
    }
  }

  /**
   * Update the single attendance policy
   */
  static async update(data: UpdateAttendancePolicyData): Promise<AttendancePolicyDocument> {
    try {
      const existing = await AttendancePolicy.findOne();
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.ATTENDANCE_POLICY_NOT_FOUND);
      }

      const updated = await AttendancePolicy.findByIdAndUpdate(
        existing._id,
        { $set: data },
        { new: true, lean: true }
      );

      return updated as AttendancePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'AttendancePolicyService', method: 'update', data });
    }
  }
}
