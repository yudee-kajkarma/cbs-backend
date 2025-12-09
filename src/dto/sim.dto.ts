import Joi, { ObjectSchema } from "joi";

const carrierEnum = ["Zain Kuwait", "Ooredoo Kuwait", "STC Kuwait", "Other"];
const currencyEnum = ["KWD", "USD", "EUR", "GBP", "AED", "SAR"];
const departmentEnum = [
  "IT",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "HR",
  "Management",
  "Other"
];
const statusEnum = ["Active", "Inactive", "Suspended", "Expired"];

// dd-mm-yyyy validator
const ddmmyyyy = Joi.string()
  .pattern(/^\d{2}-\d{2}-\d{4}$/)
  .message("must be in dd-mm-yyyy format")
  .required();

// IMEI strict
const imeiValidator = Joi.string()
  .pattern(/^[0-9]{15}$/)
  .message("IMEI must be exactly 15 digits")
  .required();

export const createSimSchema: ObjectSchema = Joi.object({
  simNumber: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().required(),

  carrier: Joi.string().valid(...carrierEnum).required(),
  planType: Joi.string().trim().required(),

  monthlyFee: Joi.number().min(0).required(),
  currency: Joi.string().valid(...currencyEnum).required(),
  extraCharges: Joi.number().min(0).required(),
  simCharges: Joi.number().min(0).required(),
  dataLimit: Joi.string().trim().required(),

  activationDate: ddmmyyyy,
  expiryDate: ddmmyyyy,

  assignedTo: Joi.string().trim().required(),
  department: Joi.string().valid(...departmentEnum).required(),

  deviceImei: imeiValidator,

  status: Joi.string().valid(...statusEnum).required(),
  notes: Joi.string().max(2000).optional(), // keep optional
});

export const updateSimSchema: ObjectSchema = Joi.object({
  simNumber: Joi.string().trim(),
  phoneNumber: Joi.string().trim(),

  carrier: Joi.string().valid(...carrierEnum),
  planType: Joi.string().trim(),

  monthlyFee: Joi.number().min(0),
  currency: Joi.string().valid(...currencyEnum),
  extraCharges: Joi.number().min(0),
  simCharges: Joi.number().min(0),
  dataLimit: Joi.string().trim(),

  activationDate: Joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/),
  expiryDate: Joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/),

  assignedTo: Joi.string().trim(),
  department: Joi.string().valid(...departmentEnum),

  // ⬅️ FIX: IMEI is OPTIONAL during update
  deviceImei: Joi.string()
    .pattern(/^[0-9]{15}$/)
    .message("IMEI must be exactly 15 digits"),

  status: Joi.string().valid(...statusEnum),
  notes: Joi.string().max(2000),
}).min(1);

export const idParamSchema: ObjectSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const getSimsQuerySchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  simNumber: Joi.string().trim(),
  phoneNumber: Joi.string().trim(),
  carrier: Joi.string().valid(...carrierEnum),
  status: Joi.string().valid(...statusEnum),
  department: Joi.string().valid(...departmentEnum),

  activationDate: Joi.string().trim(),
  expiryDate: Joi.string().trim(),
});

