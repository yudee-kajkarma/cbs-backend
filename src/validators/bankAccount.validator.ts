import Joi from "joi";
import { Currency } from "../constants";

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
}).min(1);

export const getBankAccountListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(10),
    search: Joi.string().optional().allow(""),
    currency: Joi.string().valid(...Object.values(Currency)).optional(),
    orderBy: Joi.string()
        .valid(
            "bankName",
            "accountHolder",
            "accountNumber",
            "createdAt",
            "updatedAt"
        )
        .default("createdAt"),
    sortBy: Joi.string()
        .valid("asc", "desc")
        .default("desc"),
});