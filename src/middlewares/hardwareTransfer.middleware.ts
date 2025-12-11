import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";

// Validate body
export const validateBody = (schema: ObjectSchema, skipMissing = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { allowUnknown: skipMissing });
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

// Validate query
export const validateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

// Validate params
export const validateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};
