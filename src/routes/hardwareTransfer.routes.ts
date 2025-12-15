import { Router } from "express";
import { HardwareTransferController } from "../controllers/hardwareTransfer.controller";

import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

import {
  createHardwareTransferSchema,
  updateHardwareTransferSchema,
  hardwareTransferIdSchema,
  hardwareTransferQuerySchema,
} from "../validators/hardwareTransfer.validator";

const router = Router();

// ---------- CREATE ----------
router.post(
  "/",
  validateRequest(createHardwareTransferSchema),
  HardwareTransferController.create
);

// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(hardwareTransferQuerySchema),
  HardwareTransferController.getAll
);

// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(hardwareTransferIdSchema),
  HardwareTransferController.getById
);

// ---------- UPDATE ----------
router.put(
  "/:id",
  validateParams(hardwareTransferIdSchema),
  validateRequest(updateHardwareTransferSchema),
  HardwareTransferController.update
);

// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(hardwareTransferIdSchema),
  HardwareTransferController.delete
);

export default router;
