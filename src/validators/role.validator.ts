import Joi from 'joi';
import { PERMISSIONS } from '../constants/permission.constants';

// Permission value validation
const permissionValueSchema = Joi.number().valid(PERMISSIONS.NONE, PERMISSIONS.READ, PERMISSIONS.WRITE);

// Feature permissions schema (module -> feature -> permission)
const featurePermissionsSchema = Joi.object().pattern(
  Joi.string(),
  permissionValueSchema
);

// Module permissions schema (module -> { feature -> permission })
const modulePermissionsSchema = Joi.object().pattern(
  Joi.string(),
  featurePermissionsSchema
);

// Permissions schema (nested object: module -> feature -> permission)
const permissionsSchema = Joi.object().pattern(
  Joi.string(),
  modulePermissionsSchema
);

export const roleIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  permissions: permissionsSchema.required(),
  createdBy: Joi.string().length(24).hex().optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional(),
  permissions: permissionsSchema.optional(),
  isActive: Joi.boolean().optional(),
  updatedBy: Joi.string().length(24).hex().optional(),
}).min(1);

export const createDefaultRolesSchema = Joi.object({
  createdBy: Joi.string().length(24).hex().optional(),
});

