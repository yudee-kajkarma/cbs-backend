import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/permission.middleware';
import { PERMISSIONS } from '../constants/permission.constants';

const router = Router();

/**
 * @route   GET /api/it-analytics/overview
 * @desc    Get IT module overview analytics
 * @access  Private (IT Management - Read)
 */
router.get(
  '/it-overview',
  authenticate,
  AnalyticsController.getITOverview
);

/**
 * @route   GET /api/it-analytics/assets-overview
 * @desc    Get Assets module overview analytics
 * @access  Private (Asset Management - Read)
 */
router.get(
  '/assets-overview',
  authenticate,
  AnalyticsController.getAssetsOverview
);

/**
 * @route   GET /api/it-analytics/company-docs-overview
 * @desc    Get Company Documents module overview analytics
 * @access  Private (Company Documents - Read)
 */
router.get(
  '/company-docs-overview',
  authenticate,
  AnalyticsController.getCompanyDocsOverview
);

/**
 * @route   GET /api/it-analytics/bank-overview
 * @desc    Get Bank module overview analytics
 * @access  Private (Bank Management - Read)
 */
router.get(
  '/bank-overview',
  authenticate,
  AnalyticsController.getBankOverview
);

export default router;
