import Joi from "joi";

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
