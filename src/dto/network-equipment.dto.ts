import Joi, { ObjectSchema } from "joi";

export const equipmentTypeEnum = [
  "Switch", "Router", "Firewall", "Access Point", "Load Balancer", "Gateway"
] as const;

export const statusEnum = [
  "Online", "Offline", "Maintenance", "Decommissioned"
] as const;

// DATE FORMAT dd-mm-yyyy
const ddmmyyyy = Joi.string()
  .pattern(/^\d{2}-\d{2}-\d{4}$/)
  .message("must be in dd-mm-yyyy format");

// IP VALIDATION (IPv4)
const ipv4 = Joi.string()
  .ip({ version: ["ipv4"] })
  .message("must be a valid IPv4 address");

// MAC VALIDATION → ANY STRING ALLOWED NOW
const mac = Joi.string().trim();   // <--- UPDATED

const portOptions = [2, 4, 8, 16, 24, 48];

// ===============================
// CREATE SCHEMA (UPDATED)
// ===============================
export const createNetworkEquipmentSchema: ObjectSchema = Joi.object({
  equipmentName: Joi.string().trim().required(),
  equipmentType: Joi.string().valid(...equipmentTypeEnum).required(),

  // OPTIONAL FIELDS
  ipAddress: ipv4.optional(),
  macAddress: mac.optional(),   // <--- UPDATED (no regex)

  // REQUIRED FIELDS
  serialNumber: Joi.string().trim().required(),
  numberOfPorts: Joi.number().valid(...portOptions).required(),
  location: Joi.string().trim().required(),
  purchaseDate: ddmmyyyy.required(),
  warrantyExpiry: ddmmyyyy.required(),
  firmwareVersion: Joi.string().trim().required(),
  status: Joi.string().valid(...statusEnum).required()
});

// ===============================
// UPDATE SCHEMA
// ===============================
export const updateNetworkEquipmentSchema = Joi.object({
  equipmentName: Joi.string().trim(),
  equipmentType: Joi.string().valid(...equipmentTypeEnum),

  ipAddress: ipv4,
  macAddress: mac,  // <--- UPDATED (no regex)

  serialNumber: Joi.string().trim(),
  numberOfPorts: Joi.number().valid(...portOptions),
  location: Joi.string().trim(),
  purchaseDate: ddmmyyyy,
  warrantyExpiry: ddmmyyyy,
  firmwareVersion: Joi.string().trim(),
  status: Joi.string().valid(...statusEnum)
}).min(1);

// ===============================
export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // 🔎 Search (applies to multiple fields)
  search: Joi.string().trim(),

  // 🎯 Filters for individual fields
  equipmentName: Joi.string().trim(),
  equipmentType: Joi.string().valid(...equipmentTypeEnum),
  ipAddress: Joi.string().trim(),
  macAddress: Joi.string().trim(),
  serialNumber: Joi.string().trim(),
  numberOfPorts: Joi.number().integer().min(1),
  location: Joi.string().trim(),
  purchaseDate: Joi.date(),
  warrantyExpiry: Joi.date(),
  firmwareVersion: Joi.string().trim(),
  status: Joi.string().valid(...statusEnum),

  // 📌 Sorting
  orderBy: Joi.string().valid(
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
  ),

  order: Joi.string().valid("asc", "desc").default("asc")
});
