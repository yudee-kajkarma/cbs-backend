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
  isActive: Joi.boolean().optional(),
  companyIpRanges: Joi.array()
    .items(
      Joi.string()
        .pattern(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/)
        .messages({
          'string.pattern.base': 'IP range must be in CIDR format (e.g., 192.168.1.0/24 or 2001:db8::/32)'
        })
    )
    .optional()
    .default([])
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
  isActive: Joi.boolean().optional(),
  companyIpRanges: Joi.array()
    .items(
      Joi.string()
        .pattern(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$|^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{0,4}\/\d{1,3}$/)
        .messages({
          'string.pattern.base': 'IP range must be in CIDR format (e.g., 192.168.1.0/24 or 2001:db8::/32)'
        })
    )
    .optional()
}).min(1);
