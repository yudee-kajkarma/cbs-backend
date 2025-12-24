import { Router } from "express";
import { IncentiveController } from "../controllers/incentive.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
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
  validateQuery(incentiveQuerySchema),
  IncentiveController.getAll
);

/**
 * @route   GET /api/incentives/:id
 * @desc    Get incentive by ID
 * @access  Private
 */
router.get(
  "/:id",
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
  validateParams(incentiveIdSchema),
  IncentiveController.delete
);

export default router;
