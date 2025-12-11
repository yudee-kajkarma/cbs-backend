import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

async function runValidation(
  dtoClass: any,
  data: any,
  skipMissing = false
) {
  const instance = plainToInstance(dtoClass, data);

  const errors = await validate(instance, {
    skipMissingProperties: skipMissing,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    return errors.flatMap(err => Object.values(err.constraints || {}));
  }

  return null;
}

export const validateBody = (dtoClass: any, skipMissing = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = await runValidation(dtoClass, req.body, skipMissing);
    if (errors) {
      return res.status(400).json({
        status: false,
        message: "Body validation failed",
        errors,
      });
    }
    next();
  };
};

export const validateQuery = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = await runValidation(dtoClass, req.query);
    if (errors) {
      return res.status(400).json({
        status: false,
        message: "Query validation failed",
        errors,
      });
    }
    next();
  };
};

export const validateParams = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = await runValidation(dtoClass, req.params);
    if (errors) {
      return res.status(400).json({
        status: false,
        message: "Params validation failed",
        errors,
      });
    }
    next();
  };
};
