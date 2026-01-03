import { Router } from "express";
import { SimController } from "../controllers/sim.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import { createSimSchema, updateSimSchema, idParamSchema, getSimsQuerySchema } from "../validators/sim.validator";

const router = Router();

// Create - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("it_management", "sim_management", PERMISSIONS.WRITE),
  validateBody(createSimSchema),
  SimController.create
);

// List with pagination & filters - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("it_management", "sim_management", PERMISSIONS.READ),
  validateQuery(getSimsQuerySchema),
  SimController.getAll
);

// Get one - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("it_management", "sim_management", PERMISSIONS.READ),
  validateParams(idParamSchema),
  SimController.getById
);

// Update - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("it_management", "sim_management", PERMISSIONS.WRITE),
  validateParams(idParamSchema),
  validateBody(updateSimSchema),
  SimController.update
);

// Delete - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("it_management", "sim_management", PERMISSIONS.WRITE),
  validateParams(idParamSchema),
  SimController.delete
);

export default router;
