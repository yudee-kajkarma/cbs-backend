import { Request, Response, NextFunction } from 'express';
import ipaddr from 'ipaddr.js';
import { config } from '../config/config';
import { throwError } from './errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { MetadataService } from '../services/metadata.service';

export class NetworkValidator {
  
  /**
   * Extract client IP address from request
   * Handles proxies and load balancers
   */
  static getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || '';
    
    return ip;
  }
  
  /**
   * Validate if IP is within company network
   * Reads IP ranges from metadata model (database) with request-level caching
   * @param ipAddress - IP address to validate
   * @param req - Express request object (for caching and reading metadata)
   * @returns Promise<boolean> - true if IP is in allowed ranges, false otherwise
   */
  static async isCompanyNetwork(ipAddress: string, req?: Request): Promise<boolean> {
    // Allow localhost in development
    if (config.attendance.allowLocalhost && 
        (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === 'localhost')) {
      return true;
    }
    
    try {
      // Get IP ranges from metadata (with request-level caching)
      const allowedIpRanges = await MetadataService.getCompanyIpRanges(req);
      
      // Fail-secure: Deny if no ranges configured
      if (!allowedIpRanges || allowedIpRanges.length === 0) {
        return false;
      }
      
      // Clean and validate IP
      let cleanIP = ipAddress.replace('::ffff:', '').trim();
      if (!cleanIP) return false;
      
      const addr = ipaddr.process(cleanIP);
      
      // Check each configured range
      for (const range of allowedIpRanges) {
        if (!range?.trim()) continue;
        
        const [subnet, mask] = range.split('/');
        if (!subnet?.trim()) continue;
        
        try {
          const subnetAddr = ipaddr.process(subnet.trim());
          
          // Default mask: exact match if not specified
          let maskInt: number;
          if (!mask?.trim()) {
            maskInt = subnetAddr.kind() === 'ipv4' ? 32 : 128;
          } else {
            maskInt = parseInt(mask.trim(), 10);
            if (isNaN(maskInt) || maskInt < 0) continue;
            
            const maxMask = subnetAddr.kind() === 'ipv4' ? 32 : 128;
            if (maskInt > maxMask) continue;
          }
          
          // Type-safe matching
          if (addr.kind() === subnetAddr.kind()) {
            if ((addr as any).match(subnetAddr, maskInt)) {
              return true;
            }
          }
        } catch (subnetError) {
          // Skip invalid subnet, continue to next
          continue;
        }
      }
      
      return false;
    } catch (error) {
      // Fail-secure: deny access on error
      return false;
    }
  }
  
  /**
   * Middleware to validate network connection
   * Updated to use async/await for database calls
   */
  static validateCompanyNetwork() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientIP = NetworkValidator.getClientIP(req);
        const isOnCompanyNetwork = await NetworkValidator.isCompanyNetwork(clientIP, req);
        
        if (!isOnCompanyNetwork) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_NETWORK_CONNECTION);
        }
        
        // Store IP in request for later use
        (req as any).clientIP = clientIP;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
