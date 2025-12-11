import Joi from "joi";

export const allowedAuditTypes = [
  "Financial Audit",
  "Internal Audit",
  "Compliance Audit",
  "Tax Audit",
  "Operational Audit"
];

export const auditIdDto = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createAuditDto = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(...allowedAuditTypes).required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().required(),
  auditor: Joi.string().required(),
  completionDate: Joi.date().required(),
  file: Joi.any().optional()
});

export const updateAuditDto = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().valid(...allowedAuditTypes).optional(),
  periodStart: Joi.date().optional(),
  periodEnd: Joi.date().optional(),
  auditor: Joi.string().optional(),
  completionDate: Joi.date().optional(),
  file: Joi.any().optional()
}).min(1);
