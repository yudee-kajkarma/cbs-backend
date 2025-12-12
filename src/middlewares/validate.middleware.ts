import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { throwJoiValidationError } from "../utils/errors.util";

/**
 * Validate request body
 */
export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationMessages = error.details.map(detail => detail.message).join(', ');
        throw throwJoiValidationError(validationMessages);
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationMessages = error.details.map(detail => detail.message).join(', ');
        throw throwJoiValidationError(validationMessages);
      }

      // Store validated data in res.locals since req.query is read-only
      res.locals.validatedQuery = value;
      req.query = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate request params
 */
export const validateParams = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const validationMessages = error.details.map(detail => detail.message).join(', ');
        throw throwJoiValidationError(validationMessages);
      }

      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate multipart/form-data request body
 */
export const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationMessages = error.details.map(detail => detail.message).join(', ');
        throw throwJoiValidationError(validationMessages);
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};
