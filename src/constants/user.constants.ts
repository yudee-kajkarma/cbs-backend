export enum UserRole {
  ADMIN = "ADMIN",
  HR = "HR",
  USER = "USER"
}

export const allowedUserRoles = Object.values(UserRole);

/**
 * User ID Prefix mapping
 */
export const USER_ID_PREFIX = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  USER: 'USR'
} as const;
