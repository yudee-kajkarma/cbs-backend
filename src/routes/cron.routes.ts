import { Router } from 'express';
import { CronController } from '../controllers/cron.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/permission.middleware';
import { PERMISSIONS } from '../constants/permission.constants';

const router = Router();

/**
 * POST /api/cron/trigger-expiry-check
 * Manually trigger the document expiry email — Admin/HR only
 */
// Only ADMIN and HR roles can trigger — regular USERs are blocked
router.post(
  '/trigger-expiry-check',
  authenticate,
  checkPermission('it_management', 'cron', PERMISSIONS.WRITE),
  CronController.triggerExpiryCheck
);

export default router;
