import Joi from "joi";

export const createISODto = Joi.object({
  certificateName: Joi.string().required(),
  isoStandard: Joi.string().required(),
  issueDate: Joi.date().required(),
  expiryDate: Joi.date().required(),
  certifyingBody: Joi.string().required(),
});

export const updateISODto = Joi.object({
  certificateName: Joi.string().optional(),
  isoStandard: Joi.string().optional(),
  issueDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  certifyingBody: Joi.string().optional(),
});

export const isoIdDto = Joi.object({
  id: Joi.string().length(24).required(),
});


export const isoQueryDto = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),

  certificateName: Joi.string().optional(),
  isoStandard: Joi.string().optional(),
  certifyingBody: Joi.string().optional(),

  issueDateFrom: Joi.date().optional(),
  issueDateTo: Joi.date().optional(),

  expiryDateFrom: Joi.date().optional(),
  expiryDateTo: Joi.date().optional(),

  status: Joi.string().valid("Active", "Expired", "Expiring Soon").optional(),
});
