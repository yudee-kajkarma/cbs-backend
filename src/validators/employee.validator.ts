import Joi from "joi";
import { allowedEmployeeStatuses } from "../constants/common.constants";

export const employeeIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
});

export const updateEmployeeSchema = Joi.object({
  position: Joi.string().max(100).optional(),
  department: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  joinDate: Joi.date(),
  salary: Joi.number().min(1),
  status: Joi.string().valid(...allowedEmployeeStatuses).optional(),
  documents: Joi.array()
    .items(
      Joi.object({
        fileKey: Joi.string().max(500).required(),
        expiryDate: Joi.date().required()
      })
    )
    .min(1)
    .required()
}).min(1);

