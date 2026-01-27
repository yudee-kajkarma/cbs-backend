import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/config';
import { throwError } from './errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

/**
 * JWT Payload interface for user tokens
 */
export interface UserJwtPayload {
  userId: string;
  username: string;
  userRefId: string;
  tenantRefId: string;
  fullName: string;
  role: string;
  employee?: {
    id: string;
  } | null;
  permissions: Record<string, Record<string, number>>;
  iat?: number;
  exp?: number;
}

/**
 * JWT Utility class for token operations
 */
export class JwtUtil {
  /**
   * Generate JWT token for user
   * @param payload - User payload to encode in token
   * @returns JWT token string
   */
  static generateToken(payload: Omit<UserJwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verify and decode JWT token
   * @param token - JWT token to verify
   * @returns Decoded payload
   * @throws Error if token is invalid or expired
   */
  static verifyToken(token: string): UserJwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as UserJwtPayload;
      return decoded;
    } catch (error: any) {
      console.error('JWT Verification Error:', {
        errorName: error.name,
        errorMessage: error.message,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token',
        secretConfigured: !!config.jwt.secret,
        secretLength: config.jwt.secret?.length
      });
      
      if (error.name === 'TokenExpiredError') {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TOKEN_EXPIRED);
      }
      
      // Provide more helpful message for signature mismatch
      if (error.message === 'invalid signature') {
        console.warn('⚠️  Token signature mismatch - User needs to log in again with current JWT secret');
      }
      
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_TOKEN);
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param token - JWT token to decode
   * @returns Decoded payload or null
   */
  static decodeToken(token: string): UserJwtPayload | null {
    try {
      return jwt.decode(token) as UserJwtPayload;
    } catch {
      return null;
    }
  }
}

