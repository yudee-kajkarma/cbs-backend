import Joi from 'joi';
import { allowedAttendanceFilterStatuses } from '../constants/attendance.constants';
import { allowedDepartments } from '../constants/common.constants';

/**
 * Check-in validation schema
 */
export const checkInAttendanceSchema = Joi.object({
  employeeId: Joi.string()
    .required()
    .messages({
      'any.required': 'Employee ID is required',
      'string.empty': 'Employee ID cannot be empty',
    }),
});

/**
 * Check-out validation schema
 */
export const checkOutAttendanceSchema = Joi.object({
  employeeId: Joi.string()
    .required()
    .messages({
      'any.required': 'Employee ID is required',
      'string.empty': 'Employee ID cannot be empty',
    }),
});

/**
 * Daily summary query validation schema
 */
export const dailySummaryQuerySchema = Joi.object({
  date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Invalid date format',
    }),
  status: Joi.string()
    .optional()
    .valid(...allowedAttendanceFilterStatuses)
    .messages({
      'any.only': `Status must be one of: ${allowedAttendanceFilterStatuses.join(', ')}`,
    }),
  department: Joi.string()
    .optional()
    .valid(...allowedDepartments)
    .messages({
      'any.only': `Department must be one of: ${allowedDepartments.join(', ')}`,
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
});

/**
 * Attendance history query validation schema
 */
export const attendanceHistoryQuerySchema = Joi.object({
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Invalid start date format',
    }),
  endDate: Joi.date()
    .optional()
    .min(Joi.ref('startDate'))
    .messages({
      'date.base': 'Invalid end date format',
      'date.min': 'End date must be after start date',
    }),
});

/**
 * Monthly statistics query validation schema
 */
export const monthlyStatisticsQuerySchema = Joi.object({
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
    }),
  year: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.base': 'Year must be a number',
    }),
});
