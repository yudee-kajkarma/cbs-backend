/**
 * System Role Enums
 * Matches UserRole in user.constants.ts
 */
export const SYSTEM_ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  USER: "USER",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
