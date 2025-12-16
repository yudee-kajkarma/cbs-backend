import { Router } from "express";

import { TelexTransferController } from "../controllers/telex-transfer.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  createTelexTransferSchema,
  updateTelexTransferSchema,
  telexTransferIdSchema
} from "../validators/telex-transfer.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createTelexTransferSchema),
  TelexTransferController.create
);

// LIST
router.get("/", TelexTransferController.getAll);

// GET BY ID
router.get(
  "/:id",
  validateParams(telexTransferIdSchema),
  TelexTransferController.getById
);

// UPDATE
router.put(
  "/:id",
  validateParams(telexTransferIdSchema),
  validateRequest(updateTelexTransferSchema),
  TelexTransferController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(telexTransferIdSchema),
  TelexTransferController.delete
);

export default router;
