import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';

/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */
export class AuthController {
  /**
   * Handle user login
   * @route POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const result = await AuthService.login({ username, password });

      const response = ResponseUtil.success(INFO_MESSAGES.AUTH.LOGIN_SUCCESSFUL, result);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, {
        method: 'login',
        username: req.body.username,
      });
    }
  }
}

