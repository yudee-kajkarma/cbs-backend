import { Router } from "express";
import { ChequeController } from "../controllers/cheque.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createChequeSchema,
  updateChequeSchema,
  chequeIdSchema,
  getChequeListSchema,
} from "../validators/cheque.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("banking", "cheque_printing", PERMISSIONS.WRITE),
  validateRequest(createChequeSchema),
  ChequeController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("banking", "cheque_printing", PERMISSIONS.READ),
  validateQuery(getChequeListSchema),
  ChequeController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("banking", "cheque_printing", PERMISSIONS.READ),
  validateParams(chequeIdSchema),
  ChequeController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("banking", "cheque_printing", PERMISSIONS.WRITE),
  validateParams(chequeIdSchema),
  validateRequest(updateChequeSchema),
  ChequeController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("banking", "cheque_printing", PERMISSIONS.WRITE),
  validateParams(chequeIdSchema),
  ChequeController.delete
);

export default router;
