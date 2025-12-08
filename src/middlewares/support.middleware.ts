import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";

// Validate body
export const supportValidateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

// Validate query
export const supportValidateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

// Validate params
export const supportValidateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};
