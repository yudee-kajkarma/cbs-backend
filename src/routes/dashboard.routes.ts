import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAnyRole, requireHROrAdmin } from '../middlewares';

const router = Router();

/**
 * @route   GET /api/dashboard/attendance/:employeeId
 * @desc    Get attendance overview for dashboard
 * @access  Private (Authenticated users)
 */
router.get(
  '/attendance/:employeeId',
  authenticate,
  requireAnyRole,
  DashboardController.getAttendanceOverview
);

/**
 * @route   GET /api/dashboard/leaves/:employeeId
 * @desc    Get leave overview for dashboard
 * @access  Private (Authenticated users)
 */
router.get(
  '/leaves/:employeeId',
  authenticate,
  requireAnyRole,
  DashboardController.getLeaveOverview
);

/**
 * @route   GET /api/dashboard/leave-applications/:employeeId
 * @desc    Get leave applications for dashboard
 * @access  Private (Authenticated users)
 */
router.get(
  '/leave-applications/:employeeId',
  authenticate,
  requireAnyRole,
  DashboardController.getLeaveApplicationsOverview
);

/**
 * @route   GET /api/dashboard/activity-logs/:employeeId
 * @desc    Get activity log for dashboard
 * @access  Private (Authenticated users)
 */
router.get(
  '/activity-logs/:employeeId',
  authenticate,
  requireAnyRole,
  DashboardController.getActivityLogOverview
);

/**
 * @route   GET /api/dashboard/hr/statistics
 * @desc    Get HR dashboard statistics
 * @access  Private (HR/Admin only)
 */
router.get(
  '/hr/statistics',
  authenticate,
  requireHROrAdmin,
  DashboardController.getHRStatistics
);

/**
 * @route   GET /api/dashboard/hr/activity-feed
 * @desc    Get HR activity feed
 * @access  Private (HR/Admin only)
 */
router.get(
  '/hr/activity-feed',
  authenticate,
  requireHROrAdmin,
  DashboardController.getHRActivityFeed
);

export default router;
  