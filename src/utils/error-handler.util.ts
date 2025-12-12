import { Response } from 'express';
import { ResponseUtil } from './response-formatter.util';
import { BaseError, isCustomError } from './errors.util';

/**
 * Error Handler Utility
 * Centralized error handling for controllers and services
 */
export class ErrorHandler {
  /**
   * Handle controller errors
   * @param error - Error object
   * @param res - Express response object
   * @param context - Additional context for logging
   */
  static handleControllerError(error: unknown, res: Response, context?: Record<string, any>): void {
    if (context) {
      console.error('Controller Error:', { ...context, error });
    }

    if (isCustomError(error)) {
      const errorResponse = ResponseUtil.error(error.code, error.message);
      res.status(error.statusCode).json(errorResponse);
      return;
    }

    if (error instanceof Error) {
      const errorResponse = ResponseUtil.error('CBS-5000', error.message);
      res.status(500).json(errorResponse);
      return;
    }

    const errorResponse = ResponseUtil.error('CBS-5000', 'An unexpected error occurred');
    res.status(500).json(errorResponse);
  }

  /**
   * Handle service errors
   * Re-throws custom errors, wraps unknown errors
   * @param error - Error object
   * @param context - Additional context for logging
   */
  static handleServiceError(error: unknown, context?: Record<string, any>): never {
    if (context) {
      console.error('Service Error:', { ...context, error });
    }

    // Re-throw custom errors
    if (isCustomError(error)) {
      throw error;
    }

    // Re-throw standard errors
    if (error instanceof Error) {
      throw error;
    }

    // Wrap unknown errors
    throw new Error('An unexpected error occurred');
  }
}
