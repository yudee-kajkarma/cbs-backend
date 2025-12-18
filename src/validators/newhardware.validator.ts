import Joi, { ObjectSchema } from "joi";
import { HardwareStatus, HardwareType, OperatingSystem, RAM, Storage } from "../constants";


export const createNewHardwareSchema: ObjectSchema = Joi.object({
  deviceName: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(HardwareType))
    .required(),
  serialNumber: Joi.string().required(),
  operatingSystem: Joi.string()
    .valid(...Object.values(OperatingSystem))
    .required(),
  processor: Joi.string().optional().allow(null, ""),
  ram: Joi.string()
    .valid(...Object.values(RAM))
    .optional()
    .allow(null),
  storage: Joi.string()
    .valid(...Object.values(Storage))
    .optional()
    .allow(null),
  purchaseDate: Joi.date().iso().optional().allow(null), // prefer ISO date (yyyy-mm-dd)
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  assignedTo: Joi.string().optional().allow(null, ""),
  department: Joi.string()
    .valid("IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal")
    .optional()
    .allow(null),
  status: Joi.string().valid(...Object.values(HardwareStatus)).required(),
  submittedBy: Joi.string().optional().allow(null, ""),
});

// Update — all optional, but enums still restricted
export const updateNewHardwareSchema: ObjectSchema = Joi.object({
  deviceName: Joi.string().optional(),
   type: Joi.string()
    .valid(...Object.values(HardwareType))
    .optional(),
  serialNumber: Joi.string().optional(),
  operatingSystem: Joi.string()
    .valid(...Object.values(OperatingSystem))
    .optional(),
  processor: Joi.string().optional().allow(null, ""),
  ram: Joi.string()
    .valid(...Object.values(RAM))
    .optional()
    .allow(null),
  storage: Joi.string()
    .valid(...Object.values(Storage))
    .optional()
    .allow(null),
  purchaseDate: Joi.date().iso().optional().allow(null),
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  assignedTo: Joi.string().optional().allow(null, ""),
  department: Joi.string()
    .valid("IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal")
    .optional()
    .allow(null),
  status: Joi.string().valid(...Object.values(HardwareStatus)).optional(),
  submittedBy: Joi.string().optional().allow(null, ""),
});

export const getNewHardwareListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  search: Joi.string().optional().allow(""),

  type: Joi.string()
    .valid(...Object.values(HardwareType))
    .optional(),

  operatingSystem: Joi.string()
    .valid(...Object.values(OperatingSystem))
    .optional(),

  department: Joi.string()
    .valid("IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal")
    .optional(),

  status: Joi.string()
    .valid(...Object.values(HardwareStatus))
    .optional(),

  sortBy: Joi.string()
    .valid(
      "deviceName",
      "type",
      "serialNumber",
      "operatingSystem",
      "purchaseDate",
      "warrantyExpiry",
      "department",
      "status",
      "createdAt"
    )
    .optional()
    .default("createdAt"),

  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),
});


// GET BY ID — param schema
export const getNewHardwareByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
