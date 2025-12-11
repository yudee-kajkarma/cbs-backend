import Joi, { ObjectSchema } from "joi";

// small helper for dd-mm-yyyy validation (string) if you accept string dates.
// But we prefer ISO date in body. Here we allow either ISO or dd-mm-yyyy string parse is handled in controller/service if needed.

export const createNewHardwareSchema: ObjectSchema = Joi.object({
  deviceName: Joi.string().required(),
  type: Joi.string()
    .valid("Laptop", "Desktop", "Server", "Tablet", "Workstation")
    .required(),
  serialNumber: Joi.string().required(),
  operatingSystem: Joi.string()
    .valid(
      "Windows 11 Pro",
      "Windows 10 Pro",
      "macOS Sonoma",
      "Ubuntu Server 22.04",
      "Ubuntu Desktop 22.04",
      "Linux (Other)"
    )
    .required(),
  processor: Joi.string().optional().allow(null, ""),
  ram: Joi.string()
    .valid("4GB", "8GB", "16GB", "32GB", "64GB", "128GB")
    .optional()
    .allow(null),
  storage: Joi.string()
    .valid("128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "2TB RAID", "4TB RAID")
    .optional()
    .allow(null),
  purchaseDate: Joi.date().iso().optional().allow(null), // prefer ISO date (yyyy-mm-dd)
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  assignedTo: Joi.string().optional().allow(null, ""),
  department: Joi.string()
    .valid("IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal")
    .optional()
    .allow(null),
  status: Joi.string().valid("Active", "Inactive", "Under Repair", "Retired").required(),
  submittedBy: Joi.string().optional().allow(null, ""),
});

// Update — all optional, but enums still restricted
export const updateNewHardwareSchema: ObjectSchema = Joi.object({
  deviceName: Joi.string().optional(),
  type: Joi.string()
    .valid("Laptop", "Desktop", "Server", "Tablet", "Workstation")
    .optional(),
  serialNumber: Joi.string().optional(),
  operatingSystem: Joi.string()
    .valid(
      "Windows 11 Pro",
      "Windows 10 Pro",
      "macOS Sonoma",
      "Ubuntu Server 22.04",
      "Ubuntu Desktop 22.04",
      "Linux (Other)"
    )
    .optional(),
  processor: Joi.string().optional().allow(null, ""),
  ram: Joi.string()
    .valid("4GB", "8GB", "16GB", "32GB", "64GB", "128GB")
    .optional()
    .allow(null),
  storage: Joi.string()
    .valid("128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "2TB RAID", "4TB RAID")
    .optional()
    .allow(null),
  purchaseDate: Joi.date().iso().optional().allow(null),
  warrantyExpiry: Joi.date().iso().optional().allow(null),
  assignedTo: Joi.string().optional().allow(null, ""),
  department: Joi.string()
    .valid("IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal")
    .optional()
    .allow(null),
  status: Joi.string().valid("Active", "Inactive", "Under Repair", "Retired").optional(),
  submittedBy: Joi.string().optional().allow(null, ""),
});

// List schema (pagination + filters)
// List schema (pagination + filters + sorting)
export const getNewHardwareListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  search: Joi.string().optional().allow(""),

  type: Joi.string()
    .valid("Laptop", "Desktop", "Server", "Tablet", "Workstation")
    .optional(),

  operatingSystem: Joi.string()
    .valid(
      "Windows 11 Pro",
      "Windows 10 Pro",
      "macOS Sonoma",
      "Ubuntu Server 22.04",
      "Ubuntu Desktop 22.04",
      "Linux (Other)"
    )
    .optional(),

  department: Joi.string()
    .valid("IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal")
    .optional(),

  status: Joi.string()
    .valid("Active", "Inactive", "Under Repair", "Retired")
    .optional(),

  // ⭐ SORTING ADDED HERE ⭐
sort: Joi.string()
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

order: Joi.string().valid("asc", "desc").optional().default("desc"),
});


// GET BY ID — param schema
export const getNewHardwareByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
