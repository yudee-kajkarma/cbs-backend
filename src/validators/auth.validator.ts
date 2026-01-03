import Joi from 'joi';

/**
 * Login request validation schema
 */
export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'string.empty': 'Username or email is required',
      'any.required': 'Username or email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

