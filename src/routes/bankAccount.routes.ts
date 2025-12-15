import { Router } from "express";
import { BankAccountController } from "../controllers/bankAccount.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountIdSchema,
  getBankAccountListSchema,
} from "../validators/bankAccount.validator";

const router = Router();

router.post(
  "/",
  validateRequest(createBankAccountSchema),
  BankAccountController.create
);

router.get(
  "/",
  validateQuery(getBankAccountListSchema),
  BankAccountController.getAll
);

router.get(
  "/:id",
  validateParams(bankAccountIdSchema),
  BankAccountController.getById
);

router.put(
  "/:id",
  validateParams(bankAccountIdSchema),
  validateRequest(updateBankAccountSchema),
  BankAccountController.update
);

router.delete(
  "/:id",
  validateParams(bankAccountIdSchema),
  BankAccountController.delete
);

export default router;
