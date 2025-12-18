import Joi, { ObjectSchema } from "joi";
import { EquipmentCategory, EquipmentCondition, GeneralEquipmentStatus } from "../constants/equipment.constants";
import { Currency } from "../constants/common.constants";

// CREATE
export const createEquipmentSchema: ObjectSchema = Joi.object({
  equipmentName: Joi.string().max(200).required(),
  category: Joi.string().valid(...Object.values(EquipmentCategory)).required(),
  manufacturer: Joi.string().max(100).required(),
  equipmentModel: Joi.string().max(100).optional().allow(""),
  serialNumber: Joi.string().max(100).required(),
  condition: Joi.string().valid(...Object.values(EquipmentCondition)).optional(),
  location: Joi.string().max(200).required(),
  assignedTo: Joi.string().max(100).optional().allow("", "Unassigned"),
  purchaseDate: Joi.date().iso().optional().allow(null),
  purchaseValue: Joi.number().min(0).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  currentValue: Joi.number().min(0).optional().allow(null),
  currentCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  warrantyProvider: Joi.string().max(100).optional().allow(""),
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  lastMaintenanceDate: Joi.date().iso().optional().allow(null),
  nextMaintenanceDate: Joi.date().iso().optional().allow(null),
  maintenanceContract: Joi.string().max(200).optional().allow(""),
  status: Joi.string().valid(...Object.values(GeneralEquipmentStatus)).default("Active"),
  technicalSpecifications: Joi.string().max(2000).optional().allow(""),
  notes: Joi.string().max(1000).optional().allow(""),
});

// UPDATE - all optional
export const updateEquipmentSchema: ObjectSchema = Joi.object({
  equipmentName: Joi.string().max(200).optional(),
  category: Joi.string().valid(...Object.values(EquipmentCategory)).optional(),
  manufacturer: Joi.string().max(100).optional().allow(""),
  equipmentModel: Joi.string().max(100).optional().allow(""),
  serialNumber: Joi.string().max(100).optional(),
  condition: Joi.string().valid(...Object.values(EquipmentCondition)).optional(),
  location: Joi.string().max(200).optional(),
  assignedTo: Joi.string().max(100).optional().allow("", "Unassigned"),
  purchaseDate: Joi.date().iso().optional().allow(null),
  purchaseValue: Joi.number().min(0).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  currentValue: Joi.number().min(0).optional().allow(null),
  currentCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  warrantyProvider: Joi.string().max(100).optional().allow(""),
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  lastMaintenanceDate: Joi.date().iso().optional().allow(null),
  nextMaintenanceDate: Joi.date().iso().optional().allow(null),
  maintenanceContract: Joi.string().max(200).optional().allow(""),
  status: Joi.string().valid(...Object.values(GeneralEquipmentStatus)).optional(),
  technicalSpecifications: Joi.string().max(2000).optional().allow(""),
  notes: Joi.string().max(1000).optional().allow(""),
}).min(1);

// LIST QUERY
export const getEquipmentListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(10),
  search: Joi.string().optional().allow(""),
  category: Joi.string().valid(...Object.values(EquipmentCategory)).optional(),
  condition: Joi.string().valid(...Object.values(EquipmentCondition)).optional(),
  status: Joi.string().valid(...Object.values(GeneralEquipmentStatus)).optional(),
  location: Joi.string().optional().allow(""),
  assignedTo: Joi.string().optional().allow(""),
  
  sortBy: Joi.string()
    .valid(
      "equipmentName",
      "category",
      "manufacturer",
      "serialNumber",
      "condition",
      "location",
      "status",
      "purchaseDate",
      "warrantyExpiry",
      "lastMaintenanceDate",
      "nextMaintenanceDate",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

// GET BY ID
export const getEquipmentByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
