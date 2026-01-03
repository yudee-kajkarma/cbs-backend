import { Router } from "express";
import { FurnitureController } from "../controllers/furniture.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createFurnitureSchema,
  updateFurnitureSchema,
  getFurnitureListSchema,
  getFurnitureByIdSchema,
} from "../validators/furniture.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("asset_management", "furniture", PERMISSIONS.WRITE),
  validateRequest(createFurnitureSchema),
  FurnitureController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("asset_management", "furniture", PERMISSIONS.READ),
  validateQuery(getFurnitureListSchema),
  FurnitureController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("asset_management", "furniture", PERMISSIONS.READ),
  validateParams(getFurnitureByIdSchema),
  FurnitureController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("asset_management", "furniture", PERMISSIONS.WRITE),
  validateParams(getFurnitureByIdSchema),
  validateRequest(updateFurnitureSchema),
  FurnitureController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("asset_management", "furniture", PERMISSIONS.WRITE),
  validateParams(getFurnitureByIdSchema),
  FurnitureController.delete
);

export default router;
