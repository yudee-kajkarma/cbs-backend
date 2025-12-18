import Joi from "joi";
import { allowedPayeeCategories } from "../constants/payee.constants";

export const payeeIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createPayeeSchema = Joi.object({
  name: Joi.string().required().max(200).trim(),
  company: Joi.string().optional().max(200).trim().allow(''),
  category: Joi.string().valid(...allowedPayeeCategories).required(),
  phone: Joi.string().optional().max(50).trim().allow(''),
  email: Joi.string().optional().email().max(100).trim().allow(''),
  address: Joi.string().optional().max(500).trim().allow(''),
  notes: Joi.string().optional().max(1000).trim().allow('')
});

export const updatePayeeSchema = Joi.object({
  name: Joi.string().optional().max(200).trim(),
  company: Joi.string().optional().max(200).trim().allow(''),
  category: Joi.string().valid(...allowedPayeeCategories).optional(),
  phone: Joi.string().optional().max(50).trim().allow(''),
  email: Joi.string().optional().email().max(100).trim().allow(''),
  address: Joi.string().optional().max(500).trim().allow(''),
  notes: Joi.string().optional().max(1000).trim().allow('')
}).min(1);
