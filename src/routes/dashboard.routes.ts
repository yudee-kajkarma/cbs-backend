import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares';

const router = Router();

/**
 * @route   GET /api/dashboard/user/:employeeId
 * @desc    Get comprehensive dashboard data for a user
 * @access  Private (Authenticated users)
 */
router.get(
  '/user/:employeeId',
  authenticate,
  requireAnyRole,
  DashboardController.getUserDashboard
);

export default router;
  