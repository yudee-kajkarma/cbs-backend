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
  checkPermission('it_management', 'hardware', PERMISSIONS.READ),
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
  checkPermission('asset_management', 'land_and_building', PERMISSIONS.READ),
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
  checkPermission('company_documents', 'legal_docs', PERMISSIONS.READ),
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
  checkPermission('banking', 'cheque_printing', PERMISSIONS.READ),
  AnalyticsController.getBankOverview
);

export default router;
