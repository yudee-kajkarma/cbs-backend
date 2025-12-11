import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { throwJoiValidationError } from "../utils/response.util";

// ----------------------
// Validate Body
// ----------------------
export const validateBody = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw throwJoiValidationError(message);
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// ----------------------
// Validate Params
// ----------------------
export const validateParams = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw throwJoiValidationError(message);
      }

      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// ----------------------
// Validate Query
// ----------------------
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw throwJoiValidationError(message);
      }

      // req.query is read-only → save validated values here
      res.locals.validatedQuery = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};
