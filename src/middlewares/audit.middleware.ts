import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";
import { allowedAuditTypes } from "../models/audit.model";

// ======================================================
// CREATE Audit Schema
// ======================================================
const createAuditSchema: ObjectSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(...allowedAuditTypes).required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().required(),
  auditor: Joi.string().required(),
  completionDate: Joi.date().required(),
  file: Joi.any().optional()
});

// ======================================================
// UPDATE Audit Schema
// ======================================================
const updateAuditSchema: ObjectSchema = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().valid(...allowedAuditTypes).optional(),
  periodStart: Joi.date().optional(),
  periodEnd: Joi.date().optional(),
  auditor: Joi.string().optional(),
  completionDate: Joi.date().optional(),
  file: Joi.any().optional()
}).min(1); // At least one field required

// ======================================================
// PARAM ID Schema
// ======================================================
const auditIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

// ======================================================
// Generic Validator
// ======================================================
const runValidation = (schema: ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: true,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const msg = error.details[0].message.replace(/"/g, "");
    throw throwJoiValidationError(msg);
  }

  return value;
};

// ======================================================
// Middleware Exports
// ======================================================
export class AuditMiddleware {
  static validateCreate(req: Request, res: Response, next: NextFunction) {
    try {
      req.body = runValidation(createAuditSchema, req.body);
      next();
    } catch (err) {
      next(err);
    }
  }

  static validateUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      req.body = runValidation(updateAuditSchema, req.body);
      next();
    } catch (err) {
      next(err);
    }
  }

  static validateParams(req: Request, res: Response, next: NextFunction) {
    try {
      req.params = runValidation(auditIdSchema, req.params);
      next();
    } catch (err) {
      next(err);
    }
  }
}
