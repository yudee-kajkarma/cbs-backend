import { Request, Response, NextFunction } from "express";
import { ERROR_MESSAGES } from "../utils/response.util";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  // Fix: Check both statusCode and status
  const statusCode = err.statusCode || err.status || 500;
  
  return res.status(statusCode).json({
    success: false,
    message: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};