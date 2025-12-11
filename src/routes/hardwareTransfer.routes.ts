import { Router } from "express";
import { HardwareTransferController } from "../controllers/hardwareTransfer.controller";

import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/hardwareTransfer.middleware";

import {
  createHardwareTransferDto,
  updateHardwareTransferDto,
  hardwareTransferIdDto,
  hardwareTransferQueryDto,
} from "../dto/hardwareTransfer.dto";

const router = Router();
const controller = new HardwareTransferController();

// ---------- CREATE ----------
router.post(
  "/",
  validateBody(createHardwareTransferDto),
  controller.create.bind(controller)
);

// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(hardwareTransferQueryDto),
  controller.list.bind(controller)
);

// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(hardwareTransferIdDto),
  controller.getById.bind(controller)
);

// ---------- UPDATE ----------
router.put(
  "/:id",
  validateParams(hardwareTransferIdDto),
  validateBody(updateHardwareTransferDto, true), // skip missing
  controller.update.bind(controller)
);

// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(hardwareTransferIdDto),
  controller.remove.bind(controller)
);

export default router;
