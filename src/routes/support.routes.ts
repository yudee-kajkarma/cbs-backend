import { Router } from "express";
import { SupportController } from "../controllers/support.controller";

import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createSupportSchema,
  updateSupportSchema,
  getSupportListSchema,
  getSupportByIdSchema,
} from "../validators/support.validator";

const router = Router();

/** * IT Management module - IT Support Resource Routes
 */

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("it_management", "it_support", PERMISSIONS.WRITE),
  validateRequest(createSupportSchema),
  SupportController.create
);

// GET ALL - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("it_management", "it_support", PERMISSIONS.READ),
  validateQuery(getSupportListSchema),
  SupportController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("it_management", "it_support", PERMISSIONS.READ),
  validateParams(getSupportByIdSchema),
  SupportController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("it_management", "it_support", PERMISSIONS.WRITE),
  validateParams(getSupportByIdSchema),
  validateRequest(updateSupportSchema),
  SupportController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("it_management", "it_support", PERMISSIONS.WRITE),
  validateParams(getSupportByIdSchema),
  SupportController.delete
);

export default router;
