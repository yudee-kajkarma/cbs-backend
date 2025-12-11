import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";

export const furnitureValidateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { stripUnknown: false });
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

export const furnitureValidateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};

export const furnitureValidateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) return next(throwJoiValidationError(error.details[0].message));
    next();
  };
};
