import Joi from "joi";
import { allowedEmployeeStatuses } from "../constants/common.constants";

export const employeeIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const updateEmployeeSchema = Joi.object({
  position: Joi.string().max(100).optional(),
  department: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  joinDate: Joi.date().optional(),
  salary: Joi.number().min(0).optional(),
  status: Joi.string().valid(...allowedEmployeeStatuses).optional()
}).min(1);
