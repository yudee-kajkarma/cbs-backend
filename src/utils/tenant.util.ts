import { Request } from 'express';

/**
 * Generate a unique tenant reference ID
 */
export const generateTenantRefId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}${randomStr}`.toUpperCase();
};

/**
 * Validate tenant reference ID format
 */
export const isValidTenantRefId = (tenantRefId: string): boolean => {
  return /^[A-Z0-9]{10,20}$/.test(tenantRefId);
};

/**
 * Get tenant database name from tenantRefId
 */
export const getTenantDatabaseName = (tenantRefId: string): string => {
  return `CBS_${tenantRefId}`;
};

/**
 * Check if user is a super admin (platform-wide administrator)
 * Super admins can manage all tenants regardless of which tenant they belong to
 */
export const isSystemAdmin = (req: Request): boolean => {
  const user = req.user as any;
  return user?.role === 'SUPER_ADMIN';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+]{10,20}$/;
  return phoneRegex.test(phone);
};
