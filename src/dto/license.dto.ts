import Joi from "joi";

export const createLicenseDto = Joi.object({
  name: Joi.string().required(),
  number: Joi.string().required(),
  issueDate: Joi.date().required(),
  expiryDate: Joi.date().required(),
  issuingAuthority: Joi.string().required(),
  documentKey: Joi.string().optional(),
});

export const updateLicenseDto = Joi.object({
  name: Joi.string().optional(),
  number: Joi.string().optional(),
  issueDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  issuingAuthority: Joi.string().optional(),
  documentKey: Joi.string().optional(),
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



