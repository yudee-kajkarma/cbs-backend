import { Request, Response, NextFunction } from 'express';
import ipaddr from 'ipaddr.js';
import { config } from '../config/config';
import { throwError } from './errors.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

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
   */
  static isCompanyNetwork(ipAddress: string): boolean {
    // Allow localhost in development
    if (config.attendance.allowLocalhost && 
        (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === 'localhost' || ipAddress.includes('127.0.0.1'))) {
      return true;
    }
    
    try {
      // Clean IP address (remove IPv6 prefix if present)
      let cleanIP = ipAddress.replace('::ffff:', '');
      
      const addr = ipaddr.process(cleanIP);
      
      for (const range of config.attendance.allowedIpRanges) {
        const [subnet, mask] = range.split('/');
        const subnetAddr = ipaddr.process(subnet);
        const maskInt = parseInt(mask, 10);
        
        // Check if both addresses are same type and match
        if (addr.kind() === 'ipv4' && subnetAddr.kind() === 'ipv4') {
          if ((addr as any).match(subnetAddr, maskInt)) {
            return true;
          }
        } else if (addr.kind() === 'ipv6' && subnetAddr.kind() === 'ipv6') {
          if ((addr as any).match(subnetAddr, maskInt)) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Middleware to validate network connection
   */
  static validateCompanyNetwork() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = NetworkValidator.getClientIP(req);
      
      if (!NetworkValidator.isCompanyNetwork(clientIP)) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_NETWORK_CONNECTION);
      }
      
      // Store IP in request for later use
      (req as any).clientIP = clientIP;
      next();
    };
  }
}
