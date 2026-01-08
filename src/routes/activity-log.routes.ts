import { Router } from 'express';
import { ActivityLogController } from '../controllers/activity-log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHROrAdmin } from '../middlewares/role.middleware';

const router = Router();

/**
 * @route   GET /api/activity-logs/user/:userId
 * @desc    Get recent activities for a user
 * @access  Private
 */
router.get(
  '/user/:userId',
  authenticate,
  ActivityLogController.getRecentActivities
);

/**
 * @route   GET /api/activity-logs/employee/:employeeId
 * @desc    Get recent activities for an employee
 * @access  Private
 */
router.get(
  '/employee/:employeeId',
  authenticate,
  ActivityLogController.getRecentActivitiesByEmployee
);

/**
 * @route   DELETE /api/activity-logs/cleanup
 * @desc    Delete old activity logs (cleanup)
 * @access  Private (HR/Admin)
 */
router.delete(
  '/cleanup',
  authenticate,
  requireHROrAdmin,
  ActivityLogController.deleteOldActivities
);

export default router;
