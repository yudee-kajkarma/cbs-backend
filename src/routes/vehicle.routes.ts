import { Router } from "express";
import { VehicleController } from "../controllers/vehicle.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createVehicleSchema,
  updateVehicleSchema,
  getVehicleListSchema,
  getVehicleByIdSchema,
} from "../validators/vehicle.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("asset_management", "vehicle", PERMISSIONS.WRITE),
  validateRequest(createVehicleSchema),
  VehicleController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("asset_management", "vehicle", PERMISSIONS.READ),
  validateQuery(getVehicleListSchema),
  VehicleController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("asset_management", "vehicle", PERMISSIONS.READ),
  validateParams(getVehicleByIdSchema),
  VehicleController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("asset_management", "vehicle", PERMISSIONS.WRITE),
  validateParams(getVehicleByIdSchema),
  validateRequest(updateVehicleSchema),
  VehicleController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("asset_management", "vehicle", PERMISSIONS.WRITE),
  validateParams(getVehicleByIdSchema),
  VehicleController.delete
);

export default router;
