import { Router } from "express";
import { PropertyController } from "../controllers/property.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertyListSchema,
  getPropertyByIdSchema,
} from "../validators/property.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("asset_management", "land_and_building", PERMISSIONS.WRITE),
  validateRequest(createPropertySchema),
  PropertyController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("asset_management", "land_and_building", PERMISSIONS.READ),
  validateQuery(getPropertyListSchema),
  PropertyController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("asset_management", "land_and_building", PERMISSIONS.READ),
  validateParams(getPropertyByIdSchema),
  PropertyController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("asset_management", "land_and_building", PERMISSIONS.WRITE),
  validateParams(getPropertyByIdSchema),
  validateRequest(updatePropertySchema),
  PropertyController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("asset_management", "land_and_building", PERMISSIONS.WRITE),
  validateParams(getPropertyByIdSchema),
  PropertyController.delete
);

export default router;
