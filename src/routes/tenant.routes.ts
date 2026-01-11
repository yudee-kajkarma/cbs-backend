import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireSuperAdmin } from '../middlewares/role.middleware';
import { validateRequest, validateParams } from '../middlewares/validate.middleware';
import {
  createTenantSchema,
  updateTenantSchema,
  tenantIdSchema,
} from '../validators/tenant.validator';

const router = Router();

/**
 * Note: Tenant management routes
 * - POST /api/tenants is PUBLIC for self-service tenant registration
 * - Other routes require authentication + SUPER_ADMIN role
 * These routes do NOT use tenant middleware as they manage tenant metadata
 * All operations are performed on the CBS_Admin database
 */

/**
 * @route   GET /api/tenants/stats
 * @desc    Get tenant statistics
 * @access  Super Admin only
 */
router.get('/stats', authenticate, requireSuperAdmin, TenantController.getStats);

/**
 * @route   POST /api/tenants
 * @desc    Create a new tenant (Self-service registration)
 * @access  Public
 */
router.post('/', validateRequest(createTenantSchema), TenantController.create);

/**
 * @route   GET /api/tenants
 * @desc    Get all tenants with filtering and pagination
 * @access  Super Admin only
 * @query   status, search, page, limit, sortBy, sortOrder
 */
router.get('/', authenticate, requireSuperAdmin, TenantController.getAll);

/**
 * @route   GET /api/tenants/:id
 * @desc    Get tenant by ID
 * @access  Super Admin only
 */
router.get('/:id', authenticate, requireSuperAdmin, validateParams(tenantIdSchema), TenantController.getById);

/**
 * @route   PUT /api/tenants/:id
 * @desc    Update tenant
 * @access  Super Admin only
 */
router.put(
  '/:id',
  authenticate,
  requireSuperAdmin,
  validateParams(tenantIdSchema),
  validateRequest(updateTenantSchema),
  TenantController.update
);

/**
 * @route   POST /api/tenants/:id/activate
 * @desc    Activate tenant
 * @access  Super Admin only
 */
router.post('/:id/activate', authenticate, requireSuperAdmin, validateParams(tenantIdSchema), TenantController.activate);

/**
 * @route   POST /api/tenants/:id/suspend
 * @desc    Suspend tenant
 * @access  Super Admin only
 */
router.post('/:id/suspend', authenticate, requireSuperAdmin, validateParams(tenantIdSchema), TenantController.suspend);

/**
 * @route   DELETE /api/tenants/:id
 * @desc    Permanently delete tenant (drops database)
 * @access  Super Admin only
 * @body    { confirm: "PERMANENTLY_DELETE" }
 */
router.delete('/:id', authenticate, requireSuperAdmin, validateParams(tenantIdSchema), TenantController.delete);

export default router;
