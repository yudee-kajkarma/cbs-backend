import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  AuthController.login
);

export default router;

