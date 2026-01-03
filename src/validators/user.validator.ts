import Joi from "joi";
import { allowedUserRoles } from "../constants/user.constants";

export const userIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createUserSchema = Joi.object({
  fullName: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  username: Joi.string().max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...allowedUserRoles).required()
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().max(100).optional(),
  email: Joi.string().email().max(100).optional(),
  username: Joi.string().max(50).optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid(...allowedUserRoles).optional()
}).min(1);

export const assignRolesSchema = Joi.object({
  roleIds: Joi.array()
    .items(Joi.string().length(24).hex())
    .min(1)
    .required()
    .messages({
      "array.min": "At least one role ID is required",
      "any.required": "roleIds is required"
    })
});