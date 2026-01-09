
import { Router } from "express";
import { BankBalanceController } from "../controllers/dailyBankBalance.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createBankBalanceSchema,
  updateBankBalanceSchema,
  bankBalanceIdSchema,
  getBankBalanceListSchema,
  getBankBalanceSummarySchema,
  bulkUpdateBankBalanceSchema,
} from "../validators/dailyBankBalance.validator";

const router = Router();

/**
 * Daily Bank Balance Routes
 * 
 * Module: Banking
 * Resource: daily_bank_balance
 * 
 * All routes require authentication and appropriate permissions (READ/WRITE) from the banking module.
 */

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateRequest(createBankBalanceSchema),
  BankBalanceController.create
);

// SUMMARY - Requires READ permission
router.get(
  "/summary",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.READ),
  validateQuery(getBankBalanceSummarySchema),
  BankBalanceController.getSummary
);

// BULK UPDATE - Requires WRITE permission
router.post(
  "/bulk-update",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateRequest(bulkUpdateBankBalanceSchema),
  BankBalanceController.bulkUpdate
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.READ),
  validateQuery(getBankBalanceListSchema),
  BankBalanceController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.READ),
  validateParams(bankBalanceIdSchema),
  BankBalanceController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateParams(bankBalanceIdSchema),
  validateRequest(updateBankBalanceSchema),
  BankBalanceController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("banking", "daily_bank_balance", PERMISSIONS.WRITE),
  validateParams(bankBalanceIdSchema),
  BankBalanceController.delete
);

export default router;
