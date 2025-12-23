import Joi from "joi";
import { allowedLeaveTypes, LeaveApplicationStatus } from "../constants/leave-policy.constants";

export const leaveApplicationIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const employeeIdParamSchema = Joi.object({
  employeeId: Joi.string().length(24).hex().required()
});

export const createLeaveApplicationSchema = Joi.object({
  leaveType: Joi.string().valid(...allowedLeaveTypes).required(),
  startDate: Joi.date().min('now').required().messages({
    'date.min': 'Start date cannot be in the past'
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    'date.min': 'End date must be after or equal to start date'
  }),
  reason: Joi.string().max(1000).required()
});

export const updateLeaveApplicationSchema = Joi.object({
  leaveType: Joi.string().valid(...allowedLeaveTypes).optional(),
  startDate: Joi.date().min('now').optional().messages({
    'date.min': 'Start date cannot be in the past'
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'End date must be after or equal to start date'
  }),
  reason: Joi.string().max(1000).optional()
}).min(1);

export const updateStatusLeaveApplicationSchema = Joi.object({
  rejectionReason: Joi.string().max(500).when(Joi.ref('$action'), {
    is: 'reject',
    then: Joi.required().messages({
      'any.required': 'Rejection reason is required when rejecting a leave application'
    }),
    otherwise: Joi.optional()
  })
});

export const approveRejectParamSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
  action: Joi.string().valid('approve', 'reject').required(),
  approvedBy: Joi.string().length(24).hex().required()
});
