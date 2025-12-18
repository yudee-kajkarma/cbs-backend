import Joi, { ObjectSchema } from "joi";

export const equipmentTypeEnum = [
  "Switch", "Router", "Firewall", "Access Point", "Load Balancer", "Gateway"
] as const;

export const statusEnum = [
  "Online", "Offline", "Maintenance", "Decommissioned"
] as const;

const portOptions = [2, 4, 8, 16, 24, 48];

// Base schema for reusability
const networkEquipmentBaseSchema = {
  equipmentName: Joi.string().trim(),
  equipmentType: Joi.string().valid(...equipmentTypeEnum),
  ipAddress: Joi.string().ip({ version: ["ipv4"] }),
  macAddress: Joi.string().trim(),
  serialNumber: Joi.string().trim(),
  numberOfPorts: Joi.number().valid(...portOptions),
  location: Joi.string().trim(),
  purchaseDate: Joi.date(),
  warrantyExpiry: Joi.date(),
  firmwareVersion: Joi.string().trim(),
  status: Joi.string().valid(...statusEnum),
};

// CREATE SCHEMA
export const createNetworkEquipmentSchema: ObjectSchema = Joi.object({
  equipmentName: networkEquipmentBaseSchema.equipmentName.required(),
  equipmentType: networkEquipmentBaseSchema.equipmentType.required(),
  ipAddress: networkEquipmentBaseSchema.ipAddress.optional(),
  macAddress: networkEquipmentBaseSchema.macAddress.required(),
  serialNumber: networkEquipmentBaseSchema.serialNumber.required(),
  numberOfPorts: networkEquipmentBaseSchema.numberOfPorts.required(),
  location: networkEquipmentBaseSchema.location.required(),
  purchaseDate: networkEquipmentBaseSchema.purchaseDate.required(),
  warrantyExpiry: networkEquipmentBaseSchema.warrantyExpiry.required(),
  firmwareVersion: networkEquipmentBaseSchema.firmwareVersion.required(),
  status: networkEquipmentBaseSchema.status.required(),
});

// UPDATE SCHEMA
export const updateNetworkEquipmentSchema = Joi.object({
  equipmentName: networkEquipmentBaseSchema.equipmentName.optional(),
  equipmentType: networkEquipmentBaseSchema.equipmentType.optional(),
  ipAddress: networkEquipmentBaseSchema.ipAddress.optional(),
  macAddress: networkEquipmentBaseSchema.macAddress.optional(),
  serialNumber: networkEquipmentBaseSchema.serialNumber.optional(),
  numberOfPorts: networkEquipmentBaseSchema.numberOfPorts.optional(),
  location: networkEquipmentBaseSchema.location.optional(),
  purchaseDate: networkEquipmentBaseSchema.purchaseDate.optional(),
  warrantyExpiry: networkEquipmentBaseSchema.warrantyExpiry.optional(),
  firmwareVersion: networkEquipmentBaseSchema.firmwareVersion.optional(),
  status: networkEquipmentBaseSchema.status.optional(),
}).min(1);

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  search: Joi.string().trim().optional(),

  // Filters for individual fields
  equipmentName: Joi.string().trim().optional(),
  equipmentType: Joi.string().valid(...equipmentTypeEnum).optional(),
  ipAddress: Joi.string().trim().optional(),
  macAddress: Joi.string().trim().optional(),
  serialNumber: Joi.string().trim().optional(),
  numberOfPorts: Joi.number().integer().min(1).optional(),
  location: Joi.string().trim().optional(),
  purchaseDate: Joi.date().optional(),
  warrantyExpiry: Joi.date().optional(),
  firmwareVersion: Joi.string().trim().optional(),
  status: Joi.string().valid(...statusEnum).optional(),

  // Sorting
  sortBy: Joi.string().valid(
    "equipmentName",
    "equipmentType",
    "ipAddress",
    "macAddress",
    "serialNumber",
    "numberOfPorts",
    "location",
    "purchaseDate",
    "warrantyExpiry",
    "firmwareVersion",
    "status",
    "createdAt",
    "updatedAt"
  ).optional(),

  sortOrder: Joi.string().valid("asc", "desc").optional()
});
