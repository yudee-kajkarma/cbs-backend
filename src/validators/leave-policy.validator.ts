import Joi from "joi";

export const createLeavePolicySchema = Joi.object({
  annualLeavePaid: Joi.number().min(0).required(),
  sickLeavePaid: Joi.number().min(0).required(),
  emergencyLeave: Joi.number().min(0).required(),
  maternityLeave: Joi.number().min(0).required(),
  paternityLeave: Joi.number().min(0).required(),
  unpaidLeaveMax: Joi.number().min(0).required(),
  allowCarryForward: Joi.boolean().optional().default(true),
  maxCarryForwardDays: Joi.number().min(0).optional(),
  allowNegativeBalance: Joi.boolean().optional().default(false),
  maxNegativeLeaveDays: Joi.number().min(0).optional().default(0),
  isActive: Joi.boolean().optional().default(true)
});

export const updateLeavePolicySchema = Joi.object({
  annualLeavePaid: Joi.number().min(0).optional(),
  sickLeavePaid: Joi.number().min(0).optional(),
  emergencyLeave: Joi.number().min(0).optional(),
  maternityLeave: Joi.number().min(0).optional(),
  paternityLeave: Joi.number().min(0).optional(),
  unpaidLeaveMax: Joi.number().min(0).optional(),
  allowCarryForward: Joi.boolean().optional(),
  maxCarryForwardDays: Joi.number().min(0).optional(),
  allowNegativeBalance: Joi.boolean().optional(),
  maxNegativeLeaveDays: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional()
}).min(1);
