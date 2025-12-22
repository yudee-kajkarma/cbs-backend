import Joi from "joi";

export const attendancePolicyIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createAttendancePolicySchema = Joi.object({
  standardHoursPerDay: Joi.number().min(0).max(24).required(),
  workingDaysPerWeek: Joi.number().min(1).max(7).required(),
  overtimeRateMultiplier: Joi.number().min(1).required(),
  lateArrivalGracePeriod: Joi.number().min(0).required(),
  attendanceBonusThreshold: Joi.number().min(0).max(100).required(),
  hoursConcessionPercentage: Joi.number().min(0).max(100).required(),
  shortfallDeductionPercentage: Joi.number().min(0).max(100).required(),
  isActive: Joi.boolean().optional()
});

export const updateAttendancePolicySchema = Joi.object({
  standardHoursPerDay: Joi.number().min(0).max(24).optional(),
  workingDaysPerWeek: Joi.number().min(1).max(7).optional(),
  overtimeRateMultiplier: Joi.number().min(1).optional(),
  lateArrivalGracePeriod: Joi.number().min(0).optional(),
  attendanceBonusThreshold: Joi.number().min(0).max(100).optional(),
  hoursConcessionPercentage: Joi.number().min(0).max(100).optional(),
  shortfallDeductionPercentage: Joi.number().min(0).max(100).optional(),
  isActive: Joi.boolean().optional()
}).min(1);
