import Joi from "joi";
import { Currency } from "../constants";
import { BankBalanceStatus, AccountType } from "../constants/daily-bank-balance.constants";

export const bankAccountIdSchema = Joi.object({
    id: Joi.string().length(24).hex().required(),
});

export const createBankAccountSchema = Joi.object({
    bankName: Joi.string().max(100).required(),
    branch: Joi.string().max(100),
    accountHolder: Joi.string().max(100).required(),
    accountNumber: Joi.string().max(50).required(),
    currency: Joi.string().valid(...Object.values(Currency)).default(Currency.KWD),
    currentChequeNumber: Joi.string().max(50).optional(),
    address: Joi.string().max(200).optional(),
    fileKey: Joi.string().max(500).optional(),
    type: Joi.string().valid(...Object.values(AccountType)).optional(),
    currentBalance: Joi.number().optional(),
    displayCurrency: Joi.string().trim().optional(),
    status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
});

export const updateBankAccountSchema = Joi.object({
    bankName: Joi.string().max(100).optional(),
    branch: Joi.string().max(100).optional(),
    accountHolder: Joi.string().max(100).optional(),
    accountNumber: Joi.string().max(50).optional(),
    currency: Joi.string().valid(...Object.values(Currency)).optional(),
    currentChequeNumber: Joi.string().max(50).optional(),
    address: Joi.string().max(200).optional(),
    fileKey: Joi.string().max(500).optional(),
    type: Joi.string().valid(...Object.values(AccountType)).optional(),
    currentBalance: Joi.number().optional(),
    displayCurrency: Joi.string().trim().optional(),
    status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
}).min(1);

export const bulkUpdateBankAccountSchema = Joi.object({
  updates: Joi.array().items(
    Joi.object({
      id: Joi.string().length(24).hex().required(),
      data: updateBankAccountSchema.required(),
    })
  ).min(1).required(),
});

export const getBankAccountListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(10),
    search: Joi.string().optional().allow(""),
    currency: Joi.string().valid(...Object.values(Currency)).optional(),
    bankName: Joi.string().optional(),
    type: Joi.string().valid(...Object.values(AccountType)).optional(),
    status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
    sortBy: Joi.string()
        .valid(
            "bankName",
            "accountHolder",
            "accountNumber",
            "type",
            "currentBalance",
            "status",
            "createdAt",
            "updatedAt"
        )
        .default("createdAt"),
    sortOrder: Joi.string()
        .valid("asc", "desc")
        .default("desc"),
});

export const getBankAccountSummarySchema = Joi.object({
  bankName: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(AccountType)).optional(),
  status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
  currency: Joi.string().optional(),
  baseCurrency: Joi.string().default('KWD'),
});