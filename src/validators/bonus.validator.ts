import Joi from "joi";

export const bonusIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const createBonusSchema = Joi.object({
  employeeId: Joi.string().length(24).hex().required(),
  amount: Joi.number().min(0).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});

export const updateBonusSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional()
}).min(1);

export const bonusQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  search: Joi.string().optional(),
  employeeId: Joi.string().length(24).hex().optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
  department: Joi.string().optional()
});
