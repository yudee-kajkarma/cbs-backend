import { Router } from "express";
import { HardwareTransferController } from "../controllers/hardwareTransfer.controller";

import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createHardwareTransferSchema,
  updateHardwareTransferSchema,
  hardwareTransferIdSchema,
  hardwareTransferQuerySchema,
} from "../validators/hardwareTransfer.validator";

const router = Router();

// ---------- CREATE ---------- Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("it_management", "hardware_transfer", PERMISSIONS.WRITE),
  validateRequest(createHardwareTransferSchema),
  HardwareTransferController.create
);

// ---------- GET ALL ---------- Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("it_management", "hardware_transfer", PERMISSIONS.READ),
  validateQuery(hardwareTransferQuerySchema),
  HardwareTransferController.getAll
);

// ---------- GET ONE ---------- Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("it_management", "hardware_transfer", PERMISSIONS.READ),
  validateParams(hardwareTransferIdSchema),
  HardwareTransferController.getById
);

// ---------- UPDATE ---------- Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("it_management", "hardware_transfer", PERMISSIONS.WRITE),
  validateParams(hardwareTransferIdSchema),
  validateRequest(updateHardwareTransferSchema),
  HardwareTransferController.update
);

// ---------- DELETE ---------- Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("it_management", "hardware_transfer", PERMISSIONS.WRITE),
  validateParams(hardwareTransferIdSchema),
  HardwareTransferController.delete
);

export default router;
