import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { throwError } from "../utils/errors.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { PERMISSIONS } from "../constants/permission.constants";
import { SYSTEM_ROLES } from "../constants/enums.constants";

/**
 * Permission middleware to check if user has required permission
 * Role-aware logic:
 * - ADMIN: Always allowed (full access)
 * - HR: Allowed except settings module
 * - USER: Check roles array for specific permission
 *
 * @param module - Module name (e.g., 'banking', 'company_documents')
 * @param feature - Feature name (e.g., 'cheque_printing', 'license')
 * @param requiredPermission - Required permission level (PERMISSIONS.READ or PERMISSIONS.WRITE)
 */
export const checkPermission = (
  module: string,
  feature: string,
  requiredPermission: number
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.UNAUTHORIZED_ACTION);
      }

      const userId = user.id || user._id;
      const userRole = user.role;

      if (!userId) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.UNAUTHORIZED_ACTION);
      }

      // ADMIN has full access to everything
      if (userRole === SYSTEM_ROLES.ADMIN) {
        return next();
      }

      // HR has full access except settings module
      if (userRole === SYSTEM_ROLES.HR) {
        if (module === "settings") {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED);
        }
        return next();
      }

      // USER role - check granular permissions from roles array
      const userPermissions = await UserService.getUserPermissions(userId);

      // Check if user has permission for the module
      const modulePermissions = userPermissions[module];
      if (!modulePermissions) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED);
      }

      // Check if user has permission for the feature
      const featurePermission = modulePermissions[feature];
      if (
        featurePermission === undefined ||
        featurePermission === PERMISSIONS.NONE
      ) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED);
      }

      // Check if user has required permission level using bitwise AND
      const hasPermission =
        (featurePermission & requiredPermission) === requiredPermission;

      if (!hasPermission) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.PERMISSION_DENIED);
      }

      // Permission granted, proceed to next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper middleware to check READ permission
 */
export const checkReadPermission = (module: string, feature: string) => {
  return checkPermission(module, feature, PERMISSIONS.READ);
};

/**
 * Helper middleware to check WRITE permission
 */
export const checkWritePermission = (module: string, feature: string) => {
  return checkPermission(module, feature, PERMISSIONS.WRITE);
};
