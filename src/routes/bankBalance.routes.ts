import { Router } from "express";
import { BankBalanceController } from "../controllers/bankBalance.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createBankBalanceSchema,
  updateBankBalanceSchema,
  bankBalanceIdSchema,
  getBankBalanceListSchema,
  getBankBalanceSummarySchema,
  bulkUpdateBankBalanceSchema,
} from "../validators/bankBalance.validator";

const router = Router();

router.post(
  "/",
  validateRequest(createBankBalanceSchema),
  BankBalanceController.create
);

router.get(
  "/summary",
  validateQuery(getBankBalanceSummarySchema),
  BankBalanceController.getSummary
);

router.post(
  "/bulk-update",
  validateRequest(bulkUpdateBankBalanceSchema),
  BankBalanceController.bulkUpdate
);

router.get(
  "/",
  validateQuery(getBankBalanceListSchema),
  BankBalanceController.getAll
);

router.get(
  "/:id",
  validateParams(bankBalanceIdSchema),
  BankBalanceController.getById
);

router.put(
  "/:id",
  validateParams(bankBalanceIdSchema),
  validateRequest(updateBankBalanceSchema),
  BankBalanceController.update
);

router.delete(
  "/:id",
  validateParams(bankBalanceIdSchema),
  BankBalanceController.delete
);

export default router;
