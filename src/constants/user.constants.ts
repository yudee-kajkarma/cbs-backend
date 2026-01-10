export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  HR = "HR",
  USER = "USER"
}

export const allowedUserRoles = Object.values(UserRole);

/**
 * User ID Prefix mapping
 */
export const USER_ID_PREFIX = {
  SUPER_ADMIN: 'SA',
  ADMIN: 'ADMIN',
  HR: 'HR',
  USER: 'USR'
} as const;
