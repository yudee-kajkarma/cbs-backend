import { Request, Response, NextFunction } from 'express';
import { SYSTEM_ROLES } from '../constants/enums.constants';
import { throwError } from '../utils/errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { isSystemAdmin } from '../utils/tenant.util';

/**
 * Get user role from request (set by auth middleware)
 * @param req - Express request object
 * @returns User role string or undefined
 */
const getUserRole = (req: Request): string | undefined => {
  return (req as any).user?.role;
};

/**
 * Middleware: Only SUPER_ADMIN can access
 * Used for: Tenant Management, Platform Administration routes
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!isSystemAdmin(req)) {
    return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED));
  }
  next();
};

/**
 * Middleware: Only ADMIN can access
 * Used for: Settings, System Configuration routes
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = getUserRole(req);
  if (role !== SYSTEM_ROLES.ADMIN) {
    return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED));
  }
  next();
};

/**
 * Middleware: ADMIN or HR can access
 * Used for: Employee Management, Leave Approval routes
 */
export const requireHROrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = getUserRole(req);
  if (role !== SYSTEM_ROLES.ADMIN && role !== SYSTEM_ROLES.HR) {
    return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED));
  }
  next();
};

/**
 * Middleware: Any authenticated user (ADMIN, HR, USER)
 * Used for: Dashboard, Profile, common features
 */
export const requireAnyRole = (req: Request, res: Response, next: NextFunction): void => {
  const role = getUserRole(req);
  if (!role || !Object.values(SYSTEM_ROLES).includes(role as any)) {
    return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.UNAUTHORIZED_ACTION));
  }
  next();
};

