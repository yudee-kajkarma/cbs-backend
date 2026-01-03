import { Router } from "express";

import { TelexTransferController } from "../controllers/telex-transfer.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createTelexTransferSchema,
  updateTelexTransferSchema,
  telexTransferIdSchema
} from "../validators/telex-transfer.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("banking", "telex_transfer", PERMISSIONS.WRITE),
  validateRequest(createTelexTransferSchema),
  TelexTransferController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("banking", "telex_transfer", PERMISSIONS.READ),
  TelexTransferController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("banking", "telex_transfer", PERMISSIONS.READ),
  validateParams(telexTransferIdSchema),
  TelexTransferController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("banking", "telex_transfer", PERMISSIONS.WRITE),
  validateParams(telexTransferIdSchema),
  validateRequest(updateTelexTransferSchema),
  TelexTransferController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("banking", "telex_transfer", PERMISSIONS.WRITE),
  validateParams(telexTransferIdSchema),
  TelexTransferController.delete
);

export default router;
