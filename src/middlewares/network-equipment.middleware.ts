import { ObjectSchema } from "joi";
import { Request, Response, NextFunction } from "express";
import { throwJoiValidationError } from "../utils/response.util";

const runValidation = (value: any, schema: ObjectSchema, source: "body" | "params" | "query") => {
  const { error, value: validated } = schema.validate(value, {
    abortEarly: true,
    stripUnknown: true,
    convert: true
  });
  if (error) {
    const msg = error.details[0].message.replace(/"/g, "");
    throw throwJoiValidationError(msg);
  }
  return validated;
};

export const validateBody = (schema: ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = runValidation(req.body, schema, "body");
    next();
  } catch (err) {
    next(err);
  }
};

export const validateParams = (schema: ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.params = runValidation(req.params, schema, "params");
    next();
  } catch (err) {
    next(err);
  }
};

export const validateQuery = (schema: ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.query = runValidation(req.query, schema, "query");
    next();
  } catch (err) {
    next(err);
  }
};
