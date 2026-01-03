import { Router } from "express";
import { BankAccountController } from "../controllers/bankAccount.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountIdSchema,
  getBankAccountListSchema,
} from "../validators/bankAccount.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateRequest(createBankAccountSchema),
  BankAccountController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.READ),
  validateQuery(getBankAccountListSchema),
  BankAccountController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.READ),
  validateParams(bankAccountIdSchema),
  BankAccountController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateParams(bankAccountIdSchema),
  validateRequest(updateBankAccountSchema),
  BankAccountController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateParams(bankAccountIdSchema),
  BankAccountController.delete
);

export default router;
