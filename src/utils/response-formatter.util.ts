import { getCurrentUTCDate } from './common.util';

export interface SuccessResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorApiResponse {
  code: string;
  description: string;
  timestamp: string;
}

export class ResponseUtil {
  /**
   * Create a consistent success response (returns object, not Response)
   * @param message - Success message
   * @param data - Response data
   * @returns Formatted success response
   */
  static success<T>(message: string, data: T): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: getCurrentUTCDate().toISOString(),
    };
  }

  /**
   * Create a consistent error response
   * @param code - Error code
   * @param description - Error description
   * @returns Formatted error response
   */
  static error(code: string, description: string): ErrorApiResponse {
    return {
      code,
      description,
      timestamp: getCurrentUTCDate().toISOString(),
    };
  }
}
