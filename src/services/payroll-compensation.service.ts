import PayrollCompensation from "../models/payrollCompensation.model";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  PayrollCompensationDocument,
  UpdatePayrollCompensationData
} from "../interfaces/model.interface";

export class PayrollCompensationService {
  
  /**
   * Create payroll compensation settings 
   */
  static async create(data: UpdatePayrollCompensationData): Promise<PayrollCompensationDocument> {
    try {
      const existingSettings = await PayrollCompensation.findOne();
      
      if (existingSettings) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYROLL_COMPENSATION_EXISTS);
      }

      const settings = await PayrollCompensation.create(data);
      return settings.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayrollCompensationService', method: 'create', data });
    }
  }

  /**
   * Get the single payroll compensation settings
   */
  static async get(): Promise<PayrollCompensationDocument> {
    try {
      const settings = await PayrollCompensation.findOne().lean();
      
      if (!settings) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYROLL_COMPENSATION_NOT_FOUND);
      }
      
      return settings as PayrollCompensationDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayrollCompensationService', method: 'get' });
    }
  }

  /**
   * Update the single payroll compensation settings
   */
  static async update(data: UpdatePayrollCompensationData): Promise<PayrollCompensationDocument> {
    try {
      const existing = await PayrollCompensation.findOne();
      
      if (!existing) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PAYROLL_COMPENSATION_NOT_FOUND);
      }

      const updated = await PayrollCompensation.findByIdAndUpdate(
        existing._id,
        { $set: data },
        { new: true, lean: true }
      );

      return updated as PayrollCompensationDocument;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'PayrollCompensationService', method: 'update', data });
    }
  }
}
