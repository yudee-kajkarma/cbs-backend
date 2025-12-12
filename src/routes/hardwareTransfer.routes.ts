import { Router } from "express";
import { HardwareTransferController } from "../controllers/hardwareTransfer.controller";

import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

import {
  createHardwareTransferDto,
  updateHardwareTransferDto,
  hardwareTransferIdDto,
  hardwareTransferQueryDto,
} from "../validators/hardwareTransfer.dto";

const router = Router();

// ---------- CREATE ----------
router.post(
  "/",
  validateRequest(createHardwareTransferDto),
  HardwareTransferController.create
);

// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(hardwareTransferQueryDto),
  HardwareTransferController.getAll
);

// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(hardwareTransferIdDto),
  HardwareTransferController.getById
);

// ---------- UPDATE ----------
router.put(
  "/:id",
  validateParams(hardwareTransferIdDto),
  validateRequest(updateHardwareTransferDto),
  HardwareTransferController.update
);

// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(hardwareTransferIdDto),
  HardwareTransferController.delete
);

export default router;
