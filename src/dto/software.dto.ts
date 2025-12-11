import Joi, { ObjectSchema } from "joi";

export const licenseTypeEnum = ["Subscription", "Perpetual", "Trial", "Educational"] as const;
export const departmentEnum = ["All", "IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Engineering", "Legal"] as const;
export const statusEnum = ["Active", "Expiring Soon", "Expired", "Suspended"] as const;

// Base schema fields
const softwareBaseSchema = {
  name: Joi.string().trim(),
  vendor: Joi.string().trim(),
  licenseType: Joi.string().valid(...licenseTypeEnum),
  licenseKey: Joi.string().trim(),
  totalSeats: Joi.number().integer().min(1),
  seatsUsed: Joi.number().integer().min(0),
  purchaseDate: Joi.date(),
  expiryDate: Joi.date(),
  renewalCost: Joi.string().trim(),
  assignedDepartment: Joi.string().valid(...departmentEnum),
  status: Joi.string().valid(...statusEnum),
};

export const createSoftwareSchema: ObjectSchema = Joi.object({
  name: softwareBaseSchema.name.required(),
  vendor: softwareBaseSchema.vendor.required(),
  licenseType: softwareBaseSchema.licenseType.required(),
  licenseKey: softwareBaseSchema.licenseKey.required(),
  totalSeats: softwareBaseSchema.totalSeats.required(),
  seatsUsed: softwareBaseSchema.seatsUsed.required(),
  purchaseDate: softwareBaseSchema.purchaseDate.required(),
  expiryDate: softwareBaseSchema.expiryDate.required(),
  renewalCost: softwareBaseSchema.renewalCost.required(),
  assignedDepartment: softwareBaseSchema.assignedDepartment.required(),
  status: softwareBaseSchema.status.optional(),
});

export const updateSoftwareSchema: ObjectSchema = Joi.object({
  name: softwareBaseSchema.name.optional(),
  vendor: softwareBaseSchema.vendor.optional(),
  licenseType: softwareBaseSchema.licenseType.optional(),
  licenseKey: softwareBaseSchema.licenseKey.optional(),
  totalSeats: softwareBaseSchema.totalSeats.optional(),
  seatsUsed: softwareBaseSchema.seatsUsed.optional(),
  purchaseDate: softwareBaseSchema.purchaseDate.optional(),
  expiryDate: softwareBaseSchema.expiryDate.optional(),
  renewalCost: softwareBaseSchema.renewalCost.optional(),
  assignedDepartment: softwareBaseSchema.assignedDepartment.optional(),
  status: softwareBaseSchema.status.optional(),
}).min(1);

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});



export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // ORDER & SORT
  orderBy: Joi.string().valid(
    "name",
    "vendor",
    "licenseType",
    "licenseKey",
    "renewalCost",
    "assignedDepartment",
    "status",
    "totalSeats",
    "seatsUsed",
    "purchaseDate",
    "expiryDate",
    "createdAt",
    "updatedAt"
  ).optional(),

  sortBy: Joi.string().valid("asc", "desc").optional(),

  // STRING FILTERS
  name: Joi.string().trim().optional(),
  vendor: Joi.string().trim().optional(),
  licenseType: Joi.string().valid(...licenseTypeEnum).optional(),
  licenseKey: Joi.string().trim().optional(),
  renewalCost: Joi.string().trim().optional(),
  assignedDepartment: Joi.string().valid(...departmentEnum).optional(),
  status: Joi.string().valid(...statusEnum).optional(),

  // NUMBER FILTERS
  totalSeats: Joi.number().integer().optional(),
  seatsUsed: Joi.number().integer().optional(),

  // DATE FILTERS
  purchaseDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});


