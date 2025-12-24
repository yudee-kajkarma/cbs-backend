import { Router } from "express";
import { BonusController } from "../controllers/bonus.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
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
  validateQuery(bonusQuerySchema),
  BonusController.getAll
);

/**
 * @route   GET /api/bonuses/:id
 * @desc    Get bonus by ID
 * @access  Private
 */
router.get(
  "/:id",
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
  validateParams(bonusIdSchema),
  BonusController.delete
);

export default router;
