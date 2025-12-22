import LeavePolicy from "../models/leavePolicy.model";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  LeavePolicyDocument,
  UpdateLeavePolicyData
} from "../interfaces/model.interface";

export class LeavePolicyService {
  
  /**
   * Ensure default leave policy exists (called on app startup)
   */
  static async ensureDefaultPolicy(): Promise<void> {
    try {
      const existingPolicy = await LeavePolicy.findOne();
      
      if (!existingPolicy) {
        await LeavePolicy.create({
          annualLeavePaid: 30,
          sickLeavePaid: 15,
          emergencyLeave: 5,
          maternityLeave: 70,
          paternityLeave: 3,
          unpaidLeaveMax: 10,
          allowCarryForward: true,
          maxCarryForwardDays: 10,
          allowNegativeBalance: true,
          maxNegativeLeaveDays: 5,
          isActive: true
        });
        console.log('Default leave policy created successfully');
      }
    } catch (error) {
      console.error('Failed to create default leave policy:', error);
      // Don't throw error to prevent app from crashing on startup
    }
  }

  /**
   * Get the single leave policy (auto-creates with defaults if not exists)
   */
  static async get(): Promise<LeavePolicyDocument> {
    try {
      let policy = await LeavePolicy.findOne().lean();
      
      if (!policy) {
        const newPolicy = await LeavePolicy.create({});
        return newPolicy.toObject();
      }
      
      return policy as LeavePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeavePolicyService', method: 'get' });
    }
  }

  /**
   * Update the single leave policy
   */
  static async update(data: UpdateLeavePolicyData): Promise<LeavePolicyDocument> {
    try {
      const existing = await LeavePolicy.findOne();
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.LEAVE_POLICY_NOT_FOUND);
      }

      const updated = await LeavePolicy.findByIdAndUpdate(
        existing._id,
        { $set: data },
        { new: true, lean: true }
      );

      return updated as LeavePolicyDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'LeavePolicyService', method: 'update', data });
    }
  }
}
