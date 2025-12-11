import { Router } from "express";
import { HardwareTransferController } from "../controllers/hardwareTransfer.controller";

import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/hardwareTransfer.middleware";

import {
  CreateHardwareTransferDto,
  UpdateHardwareTransferDto,
  HardwareTransferIdDto,
  HardwareTransferQueryDto,
} from "../dto/hardwareTransfer.dto";

const router = Router();
const controller = new HardwareTransferController();

// ---------- CREATE ----------
router.post(
  "/",
  validateBody(CreateHardwareTransferDto),
  controller.create.bind(controller)
);

// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(HardwareTransferQueryDto),
  controller.list.bind(controller)
);

// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(HardwareTransferIdDto),
  controller.getById.bind(controller)
);

// ---------- UPDATE ----------
router.put(
  "/:id",
  validateParams(HardwareTransferIdDto),
  validateBody(UpdateHardwareTransferDto, true), // skip missing
  controller.update.bind(controller)
);

// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(HardwareTransferIdDto),
  controller.remove.bind(controller)
);

export default router;
