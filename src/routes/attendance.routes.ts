import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { requireHROrAdmin } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { NetworkValidator } from '../utils/network-validator.util';
import {
  dailySummaryQuerySchema,
  attendanceHistoryQuerySchema,
  monthlyStatisticsQuerySchema,
  liveStreamQuerySchema,
} from '../validators/attendance.validator';

const router = Router();

/**
 * @route   POST /api/attendance/:employeeId/:action
 * @desc    Mark attendance (check-in or check-out) for employee 
 * @access  Private
 */
router.post(
  '/:employeeId/:action',
  authenticate,
  NetworkValidator.validateCompanyNetwork(),
  AttendanceController.markAttendance
);

/**
 * @route   GET /api/attendance/daily-summary
 * @desc    Get daily attendance summary with salary calculations
 * @access  Private (HR/Admin)
 */
router.get(
  '/daily-summary',
  authenticate,
  requireHROrAdmin,
  validateQuery(dailySummaryQuerySchema),
  AttendanceController.getDailySummary
);

/**
 * @route   GET /api/attendance/network-status
 * @desc    Check if user is on company network (for frontend UI indicator)
 * @access  Public
 */
router.get(
  '/network-status',
  AttendanceController.checkNetworkStatus
);

/**
 * @route   GET /api/attendance/live-stream
 * @desc    Stream real-time attendance updates via Server-Sent Events (SSE)
 * @access  Private (HR/Admin)
 * @query   department (optional) - Filter events by department
 * @query   page (optional) - Page number for initial data
 * @query   limit (optional) - Records per page for initial data
 */
router.get(
  '/live-stream',
  authenticate,
  requireHROrAdmin,
  validateQuery(liveStreamQuerySchema),
  AttendanceController.streamLiveAttendance
);

/**
 * @route   GET /api/attendance/history/:employeeId
 * @desc    Get employee attendance history for a date range
 * @access  Private
 */
router.get(
  '/history/:employeeId',
  authenticate,
  validateQuery(attendanceHistoryQuerySchema),
  AttendanceController.getAttendanceHistory
);

/**
 * @route   GET /api/attendance/monthly-statistics/:employeeId
 * @desc    Get monthly attendance statistics for employee
 * @access  Private
 */
router.get(
  '/monthly-statistics/:employeeId',
  authenticate,
  requireHROrAdmin,
  validateQuery(monthlyStatisticsQuerySchema),
  AttendanceController.getMonthlyStatistics
);

export default router;
