import { Router } from "express";
import { BonusController } from "../controllers/bonus.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createBonusSchema,
  updateBonusSchema,
  bonusIdSchema,
  bonusQuerySchema,
} from "../validators/bonus.validator";

const router = Router();

/**
 * @route   POST /api/bonuses
 * @desc    Create a new employee bonus
 * @access  Private (HR/Admin)
 */
router.post(
  "/",
  authenticate,
  requireHROrAdmin,
  validateRequest(createBonusSchema),
  BonusController.create
);

/**
 * @route   GET /api/bonuses
 * @desc    Get all bonuses with pagination and filtering
 * @access  Private (HR/Admin)
 */
router.get(
  "/",
  authenticate,
  requireHROrAdmin,
  validateQuery(bonusQuerySchema),
  BonusController.getAll
);

/**
 * @route   GET /api/bonuses/:id
 * @desc    Get bonus by ID
 * @access  Private (HR/Admin)
 */
router.get(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(bonusIdSchema),
  BonusController.getById
);

/**
 * @route   PUT /api/bonuses/:id
 * @desc    Update bonus by ID
 * @access  Private (HR/Admin)
 */
router.put(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(bonusIdSchema),
  validateRequest(updateBonusSchema),
  BonusController.update
);

/**
 * @route   DELETE /api/bonuses/:id
 * @desc    Delete bonus by ID
 * @access  Private (HR/Admin)
 */
router.delete(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(bonusIdSchema),
  BonusController.delete
);

export default router;
