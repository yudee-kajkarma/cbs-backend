import { ErrorResponse } from '../interfaces';


export class BaseError extends Error {
  public code: string;
  public statusCode: number;
  public headers?: Record<string, string>;

  constructor(
    code: string,
    description: string,
    statusCode: number = 500,
    headers?: Record<string, string>
  ) {
    super(description);
    this.code = code;
    this.statusCode = statusCode;
    this.headers = headers;
    this.name = this.constructor.name;
  }

  toResponse(): ErrorResponse {
    return {
      code: this.code,
      description: this.message,
    };
  }
}

/**
 * 400 - Bad Request Error
 */
export class ClientError extends BaseError {
  constructor(code: string, description: string, headers?: Record<string, string>) {
    super(code, description, 400, headers);
  }
}

/**
 * 401 - Unauthorized Error
 */
export class UnauthorizedError extends BaseError {
  constructor(code: string, description: string, headers?: Record<string, string>) {
    super(code, description, 401, headers);
  }
}

/**
 * 403 - Forbidden Error
 */
export class ForbiddenError extends BaseError {
  constructor(code: string, description: string, headers?: Record<string, string>) {
    super(code, description, 403, headers);
  }
}

/**
 * 404 - Not Found Error
 */
export class NotFoundError extends BaseError {
  constructor(code: string, description: string) {
    super(code, description, 404);
  }
}

/**
 * 409 - Conflict Error
 */
export class ConflictError extends BaseError {
  constructor(code: string, description: string) {
    super(code, description, 409);
  }
}

/**
 * 500 - Internal Server Error
 */
export class ServerError extends BaseError {
  constructor(code: string, description: string) {
    super(code, description, 500);
  }
}

/**
 * Utility function to create errors from error message objects
 */
export const throwError = (
  errorMessage: { code: string; message: string; status: number },
  headers?: Record<string, string>
): BaseError => {
  switch (errorMessage.status) {
    case 400:
      return new ClientError(errorMessage.code, errorMessage.message, headers);
    case 401:
      return new UnauthorizedError(errorMessage.code, errorMessage.message, headers);
    case 403:
      return new ForbiddenError(errorMessage.code, errorMessage.message, headers);
    case 404:
      return new NotFoundError(errorMessage.code, errorMessage.message);
    case 409:
      return new ConflictError(errorMessage.code, errorMessage.message);
    case 500:
      return new ServerError(errorMessage.code, errorMessage.message);
    default:
      return new BaseError(errorMessage.code, errorMessage.message, errorMessage.status, headers);
  }
};

/**
 * Special function for Joi validation errors with dynamic messages
 */
export const throwJoiValidationError = (message: string, headers?: Record<string, string>): BaseError => {
  return new ClientError('CBS-1000', message, headers);
};

/**
 * Utility function to check if an error is one of our custom errors
 */
export const isCustomError = (error: unknown): error is BaseError => {
  return error instanceof BaseError;
};
