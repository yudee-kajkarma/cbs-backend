import Joi from "joi";
import { ChequePrintStatus, ChequeTransactionStatus, ChequeOrientation } from "../constants/cheque.constants";

export const chequeIdSchema = Joi.object({
    id: Joi.string().length(24).hex().required(),
});

export const createChequeSchema = Joi.object({
    bankAccount: Joi.string().length(24).hex().required(),
    payeeName: Joi.string().max(200).required(),
    amount: Joi.number().min(0.01).required(),
    chequeDate: Joi.date().required(),
    orientation: Joi.string().valid(...Object.values(ChequeOrientation)).default(ChequeOrientation.HORIZONTAL),
    printStatus: Joi.string().valid(...Object.values(ChequePrintStatus)).default(ChequePrintStatus.PENDING),
    transactionStatus: Joi.string().valid(...Object.values(ChequeTransactionStatus)).default(ChequeTransactionStatus.NOT_SET),
});

export const updateChequeSchema = Joi.object({
    printStatus: Joi.string().valid(...Object.values(ChequePrintStatus)).optional(),
    transactionStatus: Joi.string().valid(...Object.values(ChequeTransactionStatus)).optional(),
}).min(1);

export const getChequeListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(10),
    search: Joi.string().optional().allow(""),
    bankAccount: Joi.string().length(24).hex().optional(),
    printStatus: Joi.string().valid(...Object.values(ChequePrintStatus)).optional(),
    transactionStatus: Joi.string().valid(...Object.values(ChequeTransactionStatus)).optional(),
    orientation: Joi.string().valid(...Object.values(ChequeOrientation)).optional(),
    orderBy: Joi.string()
        .valid(
            "chequeNumber",
            "payeeName",
            "amount",
            "chequeDate",
            "printStatus",
            "transactionStatus",
            "createdAt",
            "updatedAt"
        )
        .default("chequeDate"),
    sortBy: Joi.string()
        .valid("asc", "desc")
        .default("desc"),
});
