import Joi from "joi";
import { Currency } from "../constants";
import { allowedPaymentMethods } from "../constants/payroll-compensation.constants";

export const payrollCompensationIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createPayrollCompensationSchema = Joi.object({
  socialInsuranceRate: Joi.number().min(0).max(100).required(),
  payrollProcessingDay: Joi.number().min(1).max(31).required(),
  currency: Joi.string().valid(...Object.values(Currency)).required(),
  paymentMethod: Joi.string().valid(...allowedPaymentMethods).required(),
  attendanceBonusAmount: Joi.number().min(0).required(),
  isActive: Joi.boolean().optional()
});

export const updatePayrollCompensationSchema = Joi.object({
  socialInsuranceRate: Joi.number().min(0).max(100).optional(),
  payrollProcessingDay: Joi.number().min(1).max(31).optional(),
  currency: Joi.string().valid(...Object.values(Currency)).optional(),
  paymentMethod: Joi.string().valid(...allowedPaymentMethods).optional(),
  attendanceBonusAmount: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional()
}).min(1);
