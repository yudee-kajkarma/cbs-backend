import Joi from "joi";

export const createLicenseDto = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  number: Joi.string().trim().min(1).max(100).required(),
  issueDate: Joi.date().max('now').required().messages({
    'date.max': 'Issue date cannot be in the future'
  }),
  expiryDate: Joi.date()
    .greater(Joi.ref('issueDate'))
    .required()
    .messages({
      'date.greater': 'Expiry date must be after issue date'
    }),
  issuingAuthority: Joi.string().trim().min(1).max(200).required(),
  documentKey: Joi.string().optional(),
});

export const updateLicenseDto = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  number: Joi.string().trim().min(1).max(100).optional(),
  issueDate: Joi.date().max('now').optional().messages({
    'date.max': 'Issue date cannot be in the future'
  }),
  expiryDate: Joi.date()
    .when('issueDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('issueDate')),
      otherwise: Joi.date()
    })
    .messages({
      'date.greater': 'Expiry date must be after issue date'
    })
    .optional(),
  issuingAuthority: Joi.string().trim().min(1).max(200).optional(),
  documentKey: Joi.string().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// for params /:id
export const licenseIdDto = Joi.object({
  id: Joi.string().length(24).hex().required(),
});
export const licenseQueryDto = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  type: Joi.string().optional(),
  name: Joi.string().optional(),
  status: Joi.string().valid("Active", "Expired", "Expiring Soon").optional(),
  
  // NEW: SORTING
  orderBy: Joi.string()
    .valid("name", "number", "issueDate", "expiryDate", "issuingAuthority", "createdAt")
    .default("createdAt"),

  sortBy: Joi.string().valid("asc", "desc").default("desc"),
});



