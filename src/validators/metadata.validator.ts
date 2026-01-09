import Joi from "joi";

export const metadataIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createMetadataSchema = Joi.object({
  standardWorkStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Standard work start time must be in HH:MM format (e.g., 09:00)'
  }),
  halfDayHoursThreshold: Joi.number().min(0).required().messages({
    'number.min': 'Half day hours threshold cannot be negative'
  }),
  autoCheckoutTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Auto checkout time must be in HH:MM format (e.g., 23:59)'
  }),
  isActive: Joi.boolean().optional()
});

export const updateMetadataSchema = Joi.object({
  standardWorkStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
    'string.pattern.base': 'Standard work start time must be in HH:MM format (e.g., 09:00)'
  }),
  halfDayHoursThreshold: Joi.number().min(0).optional().messages({
    'number.min': 'Half day hours threshold cannot be negative'
  }),
  autoCheckoutTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
    'string.pattern.base': 'Auto checkout time must be in HH:MM format (e.g., 23:59)'
  }),
  isActive: Joi.boolean().optional()
}).min(1);
