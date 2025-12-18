import Joi, { ObjectSchema } from "joi";
import { PropertyType, PropertyUsage, Unit, OwnershipType, PropertyStatus } from "../constants/property.constants";
import { Currency } from "../constants/common.constants";

// CREATE
export const createPropertySchema: ObjectSchema = Joi.object({
  propertyName: Joi.string().max(200).required(),
  propertyType: Joi.string().valid(...Object.values(PropertyType)).required(),
  location: Joi.string().max(500).required(),
  area: Joi.number().min(0).required(),
  unit: Joi.string().valid(...Object.values(Unit)).optional(),
  propertyUsage: Joi.string().valid(...Object.values(PropertyUsage)).optional(),
  numberOfFloors: Joi.number().integer().min(1).optional(),
  ownershipType: Joi.string().valid(...Object.values(OwnershipType)),
  titleDeedNumber: Joi.string().max(100).optional().allow(""),
  purchaseDate: Joi.date().iso().optional().allow(null),
  purchaseValue: Joi.number().min(0).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  currentValue: Joi.number().min(0).optional().allow(null),
  currentCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  annualMaintenanceCost: Joi.number().min(0).optional().allow(null),
  insuranceExpiryDate: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid(...Object.values(PropertyStatus)).default("Active"),
  notes: Joi.string().max(1000).optional().allow(""),
});

// UPDATE - all optional
export const updatePropertySchema: ObjectSchema = Joi.object({
  propertyName: Joi.string().max(200).optional(),
  propertyType: Joi.string().valid(...Object.values(PropertyType)).optional(),
  location: Joi.string().max(500).optional().allow(""),
  area: Joi.number().min(0).optional(),
  unit: Joi.string().valid(...Object.values(Unit)).optional(),
  propertyUsage: Joi.string().valid(...Object.values(PropertyUsage)).optional(),
  numberOfFloors: Joi.number().integer().min(0).optional().allow(null),
  ownershipType: Joi.string().valid(...Object.values(OwnershipType)).optional(),
  titleDeedNumber: Joi.string().max(100).optional().allow(""),
  purchaseDate: Joi.date().iso().optional().allow(null),
  purchaseValue: Joi.number().min(0).optional().allow(null),
  purchaseCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  currentValue: Joi.number().min(0).optional().allow(null),
  currentCurrency: Joi.string().valid(...Object.values(Currency)).optional(),
  annualMaintenanceCost: Joi.number().min(0).optional().allow(null),
  insuranceExpiryDate: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid(...Object.values(PropertyStatus)).optional(),
  notes: Joi.string().max(1000).optional().allow(""),
}).min(1);

// LIST QUERY
export const getPropertyListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(10),
  search: Joi.string().optional().allow(""),
  propertyType: Joi.string().valid(...Object.values(PropertyType)).optional(),
  propertyUsage: Joi.string().valid(...Object.values(PropertyUsage)).optional(),
  ownershipType: Joi.string().valid(...Object.values(OwnershipType)).optional(),
  status: Joi.string().valid(...Object.values(PropertyStatus)).optional(),
  location: Joi.string().optional().allow(""),
  
  sortBy: Joi.string()
    .valid(
      "propertyName",
      "propertyType",
      "location",
      "area",
      "ownershipType",
      "status",
      "purchaseDate",
      "purchaseValue",
      "currentValue",
      "insuranceExpiryDate",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

// GET BY ID
export const getPropertyByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
