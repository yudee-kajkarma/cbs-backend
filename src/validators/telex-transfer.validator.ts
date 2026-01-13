import Joi from "joi";
import { allowedTelexTransferStatuses, allowedAuthorizedPersons } from "../constants/telex-transfer.constants";
import { allowedCurrencies } from "../constants/common.constants";

export const telexTransferIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createTelexTransferSchema = Joi.object({
  referenceNo: Joi.string().optional().max(50),
  transferDate: Joi.date().required(),
  senderBank: Joi.string().length(24).hex().required(),
  senderAccountNo: Joi.string().required().max(50),
  beneficiaryName: Joi.string().required().max(200),
  beneficiaryBankName: Joi.string().required().max(200),
  beneficiaryAccountNo: Joi.string().required().max(50),
  swiftCode: Joi.string().required().max(50),
  transferAmount: Joi.number().min(0).required(),
  currency: Joi.string().valid(...allowedCurrencies).required(),
  purpose: Joi.string().optional().max(500),
  remarks: Joi.string().optional().max(1000).allow(''),
  status: Joi.string().valid(...allowedTelexTransferStatuses).optional()
});

export const updateTelexTransferSchema = Joi.object({
  referenceNo: Joi.string().optional().max(50),
  transferDate: Joi.date().optional(),
  senderBank: Joi.string().length(24).hex().optional(),
  senderAccountNo: Joi.string().optional().max(50),
  beneficiaryName: Joi.string().optional().max(200),
  beneficiaryBankName: Joi.string().optional().max(200),
  beneficiaryAccountNo: Joi.string().optional().max(50),
  swiftCode: Joi.string().optional().max(50),
  transferAmount: Joi.number().min(0).optional(),
  currency: Joi.string().valid(...allowedCurrencies).optional(),
  purpose: Joi.string().optional().max(500),
  remarks: Joi.string().optional().max(1000).allow(''),
  status: Joi.string().valid(...allowedTelexTransferStatuses).optional()
}).min(1);

export const approveTelexTransferSchema = Joi.object({
  authorizedBy: Joi.string().required().max(200),
  status: Joi.string().valid(...allowedTelexTransferStatuses).required(),
});
