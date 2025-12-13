import Joi from "joi";
import { allowedAuditTypes } from "../constants/audit.constants";

export const auditIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createAuditSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(...allowedAuditTypes).required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().required(),
  auditor: Joi.string().required(),
  completionDate: Joi.date().required(),
  fileKey: Joi.string().optional()
});

export const updateAuditSchema = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().valid(...allowedAuditTypes).optional(),
  periodStart: Joi.date().optional(),
  periodEnd: Joi.date().optional(),
  auditor: Joi.string().optional(),
  completionDate: Joi.date().optional(),
  fileKey: Joi.string().optional()
}).min(1);
