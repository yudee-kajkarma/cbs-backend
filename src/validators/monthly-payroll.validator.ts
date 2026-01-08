import Joi from "joi";
import { allowedMonthlyPayrollStatuses } from "../constants/monthly-payroll.constants";

export const payrollIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const generatePayrollSchema = Joi.object({
  employeeId: Joi.string().length(24).hex().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});

export const updatePayrollSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
  status: Joi.string().valid(...allowedMonthlyPayrollStatuses).required()
});

export const payrollQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  search: Joi.string().optional(),
  employeeId: Joi.string().length(24).hex().optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
  status: Joi.string().valid(...allowedMonthlyPayrollStatuses).optional(),
  department: Joi.string().optional()
});

export const processAllPayrollSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});

export const statisticsQuerySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});

export const exportReportQuerySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required()
});
