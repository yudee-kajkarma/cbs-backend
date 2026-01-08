import Joi from "joi";
import { BankBalanceStatus, AccountType } from "../constants/daily-bank-balance.constants";

export const bankBalanceIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

export const createBankBalanceSchema = Joi.object({
  account: Joi.string().max(100).required(),
  bank: Joi.string().max(100).required(),
  branch: Joi.string().max(100).optional().allow(''),
  type: Joi.string().valid(...Object.values(AccountType)).required(),
  currentBalance: Joi.number().required(),
  currency: Joi.string().trim().default('USD'),
  finalBalance: Joi.number().optional(),
  displayCurrency: Joi.string().trim().default('KWD'),
  status: Joi.string().valid(...Object.values(BankBalanceStatus)).default(BankBalanceStatus.ACTIVE),
});

export const updateBankBalanceSchema = Joi.object({
  account: Joi.string().max(100).optional(),
  bank: Joi.string().max(100).optional(),
  branch: Joi.string().max(100).optional().allow(''),
  type: Joi.string().valid(...Object.values(AccountType)).optional(),
  currentBalance: Joi.number().optional(),
  currency: Joi.string().trim().optional(),
  finalBalance: Joi.number().optional(),
    displayCurrency: Joi.string().trim().optional(),
  status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
}).min(1);

export const bulkUpdateBankBalanceSchema = Joi.object({
  updates: Joi.array().items(
    Joi.object({
      id: Joi.string().length(24).hex().required(),
      data: updateBankBalanceSchema.required(),
    })
  ).min(1).required(),
});

export const getBankBalanceListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(10),
  search: Joi.string().optional().allow(""),
  bank: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(AccountType)).optional(),
  status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
  currency: Joi.string().optional(),
  sortBy: Joi.string()
    .valid(
      "account",
      "bank",
      "type",
      "currentBalance",
      "finalBalance",
      "status",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),
  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

export const getBankBalanceSummarySchema = Joi.object({
  bank: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(AccountType)).optional(),
  status: Joi.string().valid(...Object.values(BankBalanceStatus)).optional(),
  currency: Joi.string().optional(),
});
