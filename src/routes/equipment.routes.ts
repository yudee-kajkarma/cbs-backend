import { Router } from "express";
import { EquipmentController } from "../controllers/equipment.controller";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  getEquipmentListSchema,
  getEquipmentByIdSchema,
} from "../validators/equipment.validator";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

const router = Router();


/** * Asset Management module - Equipment Resource Routes
 */

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("asset_management", "equipment", PERMISSIONS.WRITE),
  validateRequest(createEquipmentSchema),
  EquipmentController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("asset_management", "equipment", PERMISSIONS.READ),
  validateQuery(getEquipmentListSchema),
  EquipmentController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("asset_management", "equipment", PERMISSIONS.READ),
  validateParams(getEquipmentByIdSchema),
  EquipmentController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("asset_management", "equipment", PERMISSIONS.WRITE),
  validateParams(getEquipmentByIdSchema),
  validateRequest(updateEquipmentSchema),
  EquipmentController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("asset_management", "equipment", PERMISSIONS.WRITE),
  validateParams(getEquipmentByIdSchema),
  EquipmentController.delete
);

export default router;
