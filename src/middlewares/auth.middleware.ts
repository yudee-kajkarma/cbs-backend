import { Request, Response, NextFunction } from 'express';
import { JwtUtil, UserJwtPayload } from '../utils/jwt.util';
import { throwError, isCustomError } from '../utils/errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

/**
 * Extend Express Request to include user payload
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}

/**
 * Extract bearer token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user payload to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.TOKEN_REQUIRED));
    }

    // Verify and decode token
    const decoded = JwtUtil.verifyToken(token);

    // Attach user payload to request
    req.user = decoded;

    next();
  } catch (error) {
    if (isCustomError(error)) {
      return next(error);
    }
    next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_TOKEN));
  }
};

/**
 * Optional authentication middleware
 * Attaches user payload if token is provided, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
      const decoded = JwtUtil.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch {
    // Token is invalid but optional, continue without user
    next();
  }
};

