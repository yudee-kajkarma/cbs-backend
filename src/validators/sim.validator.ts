import Joi, { ObjectSchema } from "joi";

const carrierEnum = ["Zain Kuwait", "Ooredoo Kuwait", "STC Kuwait", "Other"];
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

// Base schema fields
const simBaseSchema = {
  simNumber: Joi.string().trim(),
  phoneNumber: Joi.string().trim(),
  carrier: Joi.string().valid(...carrierEnum),
  planType: Joi.string().trim(),
  monthlyFee: Joi.number().min(0),
  currency: Joi.string().valid(...["KWD", "USD", "EUR", "GBP", "JPY", "AED"]),
  extraCharges: Joi.number().min(0),
  simCharges: Joi.number().min(0),
  dataLimit: Joi.string().trim(),
  activationDate: Joi.date(),
  expiryDate: Joi.date(),
  assignedTo: Joi.string().trim(),
  department: Joi.string().valid(...departmentEnum),
  deviceImei: Joi.string().pattern(/^[0-9]{15}$/).message("IMEI must be exactly 15 digits"),
  status: Joi.string().valid(...statusEnum),
  notes: Joi.string().max(2000),
};

export const createSimSchema: ObjectSchema = Joi.object({
  simNumber: simBaseSchema.simNumber.required(),
  phoneNumber: simBaseSchema.phoneNumber.optional(),
  carrier: simBaseSchema.carrier.required(),
  planType: simBaseSchema.planType.optional(),
  monthlyFee: simBaseSchema.monthlyFee.optional(),
  currency: simBaseSchema.currency.optional(),
  extraCharges: simBaseSchema.extraCharges.optional(),
  simCharges: simBaseSchema.simCharges.optional(),
  dataLimit: simBaseSchema.dataLimit.optional(),
  activationDate: simBaseSchema.activationDate.optional(),
  expiryDate: simBaseSchema.expiryDate.optional(),
  assignedTo: simBaseSchema.assignedTo.optional(),
  department: simBaseSchema.department.optional(),
  deviceImei: simBaseSchema.deviceImei.optional(),
  status: simBaseSchema.status.optional(),
  notes: simBaseSchema.notes.optional(),
});

export const updateSimSchema: ObjectSchema = Joi.object({
  simNumber: simBaseSchema.simNumber.optional(),
  phoneNumber: simBaseSchema.phoneNumber.optional(),
  carrier: simBaseSchema.carrier.optional(),
  planType: simBaseSchema.planType.optional(),
  monthlyFee: simBaseSchema.monthlyFee.optional(),
  currency: simBaseSchema.currency.optional(),
  extraCharges: simBaseSchema.extraCharges.optional(),
  simCharges: simBaseSchema.simCharges.optional(),
  dataLimit: simBaseSchema.dataLimit.optional(),
  activationDate: simBaseSchema.activationDate.optional(),
  expiryDate: simBaseSchema.expiryDate.optional(),
  assignedTo: simBaseSchema.assignedTo.optional(),
  department: simBaseSchema.department.optional(),
  deviceImei: simBaseSchema.deviceImei.optional(),
  status: simBaseSchema.status.optional(),
  notes: simBaseSchema.notes.optional(),
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

  sortBy: Joi.string()
    .valid(
      "simNumber",
      "phoneNumber",
      "carrier",
      "status",
      "department",
      "activationDate",
      "expiryDate",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),

  sortOrder: Joi.string().valid("asc", "desc").default("desc")
});


