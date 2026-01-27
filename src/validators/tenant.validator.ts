import Joi from 'joi';
import { TenantStatus } from '../models/tenant.model';

export const tenantIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

export const createTenantSchema = Joi.object({
  companyName: Joi.string().trim().max(200).required(),
  companyEmail: Joi.string().email().max(100).required(),
  companyPhone: Joi.string().trim().max(20).required(),
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
  address: Joi.object({
    city: Joi.string().trim().max(100).optional(),
    state: Joi.string().trim().max(100).optional(),
    country: Joi.string().trim().max(100).optional(),
    zipCode: Joi.string().trim().max(20).optional(),
  }).optional(),
});

export const updateTenantSchema = Joi.object({
  companyName: Joi.string().trim().max(200).optional(),
  companyEmail: Joi.string().email().max(100).optional(),
  companyPhone: Joi.string().trim().max(20).optional(),
  status: Joi.string()
    .valid(...Object.values(TenantStatus))
    .optional(),
  address: Joi.object({
    city: Joi.string().trim().max(100).optional(),
    state: Joi.string().trim().max(100).optional(),
    country: Joi.string().trim().max(100).optional(),
    zipCode: Joi.string().trim().max(20).optional(),
  }).optional(),
}).min(1);

export const tenantQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(TenantStatus))
    .optional(),
});

export const permanentDeleteSchema = Joi.object({
  confirm: Joi.string().valid('PERMANENTLY_DELETE').required(),
});

