import { Request, Response, NextFunction } from "express";
import { ERROR_MESSAGES } from "../utils/response.util";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};
