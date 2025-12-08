import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";

export const newHardwareValidateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

export const newHardwareValidateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

export const newHardwareValidateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};
