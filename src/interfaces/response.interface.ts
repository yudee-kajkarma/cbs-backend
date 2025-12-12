/**
 * Success Response Interface
 */
export interface SuccessResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
  code: string;
  description: string;
}

/**
 * Error API Response Interface
 */
export interface ErrorApiResponse {
  code: string;
  description: string;
  timestamp: string;
}
