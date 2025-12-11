import { Response } from 'express';
import { sendError } from './response.util';
import { config } from '../config/config';

/**
 * Format error message safely
 * Prevents exposing sensitive information in production
 */
export const formatErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Check if error is a MongoDB duplicate key error
 */
export const isDuplicateKeyError = (error: any): boolean => {
  return error?.code === 11000 || error?.name === 'MongoServerError';
};

/**
 * Extract duplicate field name from MongoDB error
 */
export const getDuplicateField = (error: any): string => {
  if (error?.keyPattern) {
    return Object.keys(error.keyPattern)[0] || 'field';
  }
  if (error?.message) {
    const match = error.message.match(/index: (.+?)_/);
    return match ? match[1] : 'field';
  }
  return 'field';
};

/**
 * Check if error is a MongoDB validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.name === 'ValidationError';
};

/**
 * Check if error is a MongoDB cast error (invalid ObjectId)
 */
export const isCastError = (error: any): boolean => {
  return error?.name === 'CastError';
};

/**
 * Centralized error handler for controllers
 * Provides consistent error responses across all endpoints
 * 
 * @param res - Express response object
 * @param error - Error object
 * @param defaultMessage - Default error message
 * @returns Express response
 */
export const handleControllerError = (
  res: Response,
  error: any,
  defaultMessage: string = 'Something went wrong'
) => {
  // Log full error in development
  if (config.env === 'development') {
    console.error('Controller Error:', error);
  }

  // Handle MongoDB duplicate key errors
  if (isDuplicateKeyError(error)) {
    const field = getDuplicateField(error);
    return sendError(
      res,
      409,
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      config.env === 'development' ? formatErrorMessage(error) : undefined
    );
  }

  // Handle MongoDB validation errors
  if (isValidationError(error)) {
    const messages = Object.values(error.errors || {})
      .map((err: any) => err.message)
      .join(', ');
    return sendError(
      res,
      400,
      messages || 'Validation failed',
      config.env === 'development' ? formatErrorMessage(error) : undefined
    );
  }

  // Handle MongoDB cast errors (invalid ObjectId)
  if (isCastError(error)) {
    return sendError(
      res,
      400,
      'Invalid ID format',
      config.env === 'development' ? formatErrorMessage(error) : undefined
    );
  }

  // Handle custom errors with status codes
  if (error?.statusCode) {
    return sendError(
      res,
      error.statusCode,
      error.message || defaultMessage,
      config.env === 'development' ? formatErrorMessage(error) : undefined
    );
  }

  // Default to 500 Internal Server Error
  return sendError(
    res,
    500,
    defaultMessage,
    config.env === 'development' ? formatErrorMessage(error) : undefined
  );
};

/**
 * Create a custom error with status code
 */
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error constructors
 */
export const NotFoundError = (resource: string = 'Resource') => 
  new AppError(`${resource} not found`, 404);

export const BadRequestError = (message: string = 'Bad request') => 
  new AppError(message, 400);

export const UnauthorizedError = (message: string = 'Unauthorized') => 
  new AppError(message, 401);

export const ForbiddenError = (message: string = 'Forbidden') => 
  new AppError(message, 403);

export const ConflictError = (message: string = 'Resource already exists') => 
  new AppError(message, 409);
