import { Request, Response, NextFunction } from "express";
import { BaseError } from "../utils/errors.util";
import { ResponseUtil } from "../utils/response-formatter.util";

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them consistently
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error("ERROR:", {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
  });

  // Handle custom errors
  if (err instanceof BaseError) {
    const errorResponse = ResponseUtil.error(err.code, err.message);

    // Set custom headers if they exist
    if (err.headers) {
      Object.entries(err.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Joi validation errors
  if (err.type === "JoiValidationError") {
    const errorResponse = ResponseUtil.error("CBS-1000", err.message);
    res.status(400).json(errorResponse);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError || err.message?.includes('JSON')) {
    const errorResponse = ResponseUtil.error("CBS-1001", "Invalid JSON format");
    res.status(400).json(errorResponse);
    return;
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errorResponse = ResponseUtil.error("CBS-1002", "Validation error");
    res.status(400).json(errorResponse);
    return;
  }

  // Handle mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const errorResponse = ResponseUtil.error("CBS-1003", "Duplicate key error");
    res.status(409).json(errorResponse);
    return;
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    const errorResponse = ResponseUtil.error("CBS-1004", "Invalid ID format");
    res.status(400).json(errorResponse);
    return;
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const errorResponse = ResponseUtil.error(
    "CBS-5000",
    err.message || "Internal server error"
  );
  res.status(statusCode).json(errorResponse);
};