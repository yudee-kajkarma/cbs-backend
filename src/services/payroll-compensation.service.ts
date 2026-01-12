import { PayrollCompensation } from "../models";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  PayrollCompensationDocument,
  UpdatePayrollCompensationData
} from "../interfaces/model.interface";

export class PayrollCompensationService {
  
  /**
   * Get the single payroll compensation settings
   */
  static async get(): Promise<PayrollCompensationDocument | null> {
    try {
      const settings = await PayrollCompensation.findOne().lean();
      
      return settings as PayrollCompensationDocument | null;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayrollCompensationService', method: 'get' });
    }
  }

  /**
   * Update the single payroll compensation settings (upsert: creates if doesn't exist, updates if exists)
   */
  static async update(data: UpdatePayrollCompensationData): Promise<PayrollCompensationDocument> {
    try {
      // Use findOneAndUpdate with upsert to create if not exists, update if exists
      const updated = await PayrollCompensation.findOneAndUpdate(
        {}, // Empty filter - find any document (singleton pattern)
        { $set: data },
        { 
          new: true, 
          lean: true,
          upsert: true, // Create if doesn't exist
          setDefaultsOnInsert: true // Apply schema defaults when creating
        }
      );

      return updated as PayrollCompensationDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayrollCompensationService', method: 'update', data });
    }
  }
}
