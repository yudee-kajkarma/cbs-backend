import { Router } from "express";
import { IncentiveController } from "../controllers/incentive.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createIncentiveSchema,
  updateIncentiveSchema,
  incentiveIdSchema,
  incentiveQuerySchema,
} from "../validators/incentive.validator";

const router = Router();

/**
 * @route   POST /api/incentives
 * @desc    Create a new employee incentive
 * @access  Private (HR/Admin)
 */
router.post(
  "/",
  authenticate,
  requireHROrAdmin,
  validateRequest(createIncentiveSchema),
  IncentiveController.create
);

/**
 * @route   GET /api/incentives
 * @desc    Get all incentives with pagination and filtering
 * @access  Private (HR/Admin)
 */
router.get(
  "/",
  authenticate,
  requireHROrAdmin,
  validateQuery(incentiveQuerySchema),
  IncentiveController.getAll
);

/**
 * @route   GET /api/incentives/:id
 * @desc    Get incentive by ID
 * @access  Private (HR/Admin)
 */
router.get(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(incentiveIdSchema),
  IncentiveController.getById
);

/**
 * @route   PUT /api/incentives/:id
 * @desc    Update incentive by ID
 * @access  Private (HR/Admin)
 */
router.put(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(incentiveIdSchema),
  validateRequest(updateIncentiveSchema),
  IncentiveController.update
);

/**
 * @route   DELETE /api/incentives/:id
 * @desc    Delete incentive by ID
 * @access  Private (HR/Admin)
 */
router.delete(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(incentiveIdSchema),
  IncentiveController.delete
);

export default router;
