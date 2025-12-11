import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";
import { createAuditDto, updateAuditDto, auditIdDto } from "../dto/audit.dto";

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
      req.body = runValidation(createAuditDto, req.body);
      next();
    } catch (err) {
      next(err);
    }
  }

  static validateUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      req.body = runValidation(updateAuditDto, req.body);
      next();
    } catch (err) {
      next(err);
    }
  }

  static validateParams(req: Request, res: Response, next: NextFunction) {
    try {
      req.params = runValidation(auditIdDto, req.params);
      next();
    } catch (err) {
      next(err);
    }
  }
}
