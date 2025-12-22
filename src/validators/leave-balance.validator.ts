import Joi from "joi";

export const leaveBalanceIdSchema = Joi.object({
  employeeId: Joi.string().length(24).hex().required()
});

export const initializeLeaveBalanceSchema = Joi.object({
  employeeId: Joi.string().length(24).hex().required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});

export const updateLeaveBalanceSchema = Joi.object({
  annualLeave: Joi.object({
    totalAllocation: Joi.number().min(0).optional(),
    used: Joi.number().min(0).optional(),
    remaining: Joi.number().min(0).optional()
  }).optional(),
  sickLeave: Joi.object({
    totalAllocation: Joi.number().min(0).optional(),
    used: Joi.number().min(0).optional(),
    remaining: Joi.number().min(0).optional()
  }).optional(),
  emergencyLeave: Joi.object({
    totalAllocation: Joi.number().min(0).optional(),
    used: Joi.number().min(0).optional(),
    remaining: Joi.number().min(0).optional()
  }).optional(),
  unpaidLeave: Joi.object({
    totalAllowed: Joi.number().min(0).optional(),
    used: Joi.number().min(0).optional(),
    remaining: Joi.number().min(0).optional()
  }).optional()
}).min(1);
