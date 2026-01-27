import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/config';
import { setTenantContext, addActiveConnection, getConnectionByTenantDbName } from '../utils/tenant-context';
import { getTenantModel } from '../utils/admin-connection';
import { JwtUtil } from '../utils/jwt.util';
import { throwError } from '../utils/errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { registerAllModelsOnConnection } from '../utils/register-models';

// Extend Request interface to include tenantRefId and tenantDbName
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantRefId?: string;
      tenantDbName?: string;
    }
  }
}

/**
 * Tenant middleware - Extracts tenant information from JWT and sets up tenant context
 * This middleware should be applied to all routes that require tenant isolation
 * 
 * NOTE: This middleware assumes authentication has already been performed by the authenticate middleware
 * It extracts tenant context from the already-verified user payload
 */
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if user is already authenticated (by authenticate middleware)
    // If not, try to extract and verify token ourselves for backwards compatibility
    let decoded = req.user;
    
    if (!decoded) {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.TOKEN_REQUIRED));
      }

      const token = authHeader.substring(7);
      
      // Verify and decode token
      decoded = JwtUtil.verifyToken(token);
      req.user = decoded;
    }

    // Get tenantRefId from JWT payload
    const tenantRefId = decoded.tenantRefId;
    
    if (!tenantRefId) {
      return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_ID_MISSING));
    }

    // Skip tenant middleware for super admins (they don't have tenant databases)
    if (decoded.role === 'SUPER_ADMIN' || tenantRefId === 'SYSTEM') {
      req.tenantRefId = tenantRefId;
      console.log(`Skipping tenant middleware for super admin: ${decoded.username}`);
      return next();
    }

    // Validate that tenant exists in CBS_Admin.tenants
    const TenantModel = await getTenantModel();
    const tenant = await TenantModel.findOne({ tenantRefId });
    
    if (!tenant) {
      console.error(`Tenant validation failed: No tenant record found for tenantRefId: ${tenantRefId}`);
      console.error(`User: ${decoded.username}, Database would be: CBS_${tenantRefId}`);
      return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND));
    }

    // Check if tenant is active
    if (tenant.status !== 'active') {
      console.warn(`Tenant access denied: Tenant ${tenantRefId} has status: ${tenant.status}`);
      return next(throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_INACTIVE));
    }

    // Set tenantRefId on request
    req.tenantRefId = tenantRefId;

    // Create database name for this tenant
    const tenantDbName = `CBS_${tenantRefId}`;
    req.tenantDbName = tenantDbName;

    // Check if connection already exists
    let connection = getConnectionByTenantDbName(tenantDbName);

    if (!connection) {
      // Create new connection for this tenant
      const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, ''); // Remove database name from URI
      const tenantUri = `${baseUri}/${tenantDbName}`;

      connection = await mongoose.createConnection(tenantUri);

      // Register all models on this connection for populate to work
      registerAllModelsOnConnection(connection);

      // Store connection for reuse
      addActiveConnection(tenantDbName, connection);

      console.log(`✓ Created new database connection for tenant: ${tenantDbName}`);
    }

    // Run this request inside its tenant context using AsyncLocalStorage
    setTenantContext(tenantRefId, tenantDbName, connection, () => {
      next();
    });
  } catch (error) {
    console.error('Tenant middleware error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantRefId: req.tenantRefId,
      tenantDbName: req.tenantDbName,
    });

    // Re-throw the error to be handled by error middleware
    next(error);
  }
};

/**
 * Helper function to get the current tenant connection (for backward compatibility)
 * @param req - Express request object
 * @returns Tenant-specific MongoDB connection
 */
export const getTenantConnection = (req: Request): mongoose.Connection => {
  const tenantDbName = req.tenantDbName;
  if (!tenantDbName) {
    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_DB_NAME_NOT_FOUND);
  }
  const connection = getConnectionByTenantDbName(tenantDbName);
  if (!connection) {
    throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_CONNECTION_NOT_FOUND);
  }
  return connection;
};
