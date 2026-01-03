import { Router } from "express";
import { NetworkEquipmentController } from "../controllers/network-equipment.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createNetworkEquipmentSchema,
  updateNetworkEquipmentSchema,
  idParamSchema,
  listQuerySchema
} from "../validators/network-equipment.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("it_management", "network_equipment", PERMISSIONS.WRITE),
  validateRequest(createNetworkEquipmentSchema),
  NetworkEquipmentController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("it_management", "network_equipment", PERMISSIONS.READ),
  validateQuery(listQuerySchema),
  NetworkEquipmentController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("it_management", "network_equipment", PERMISSIONS.READ),
  validateParams(idParamSchema),
  NetworkEquipmentController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("it_management", "network_equipment", PERMISSIONS.WRITE),
  validateParams(idParamSchema),
  validateRequest(updateNetworkEquipmentSchema),
  NetworkEquipmentController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("it_management", "network_equipment", PERMISSIONS.WRITE),
  validateParams(idParamSchema),
  NetworkEquipmentController.delete
);

export default router;
