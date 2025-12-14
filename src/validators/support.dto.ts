import Joi, { ObjectSchema } from "joi";

// CREATE
export const createSupportSchema: ObjectSchema = Joi.object({
  ticketTitle: Joi.string().required(),

  category: Joi.string()
    .valid(
      "Hardware", "Software", "Network", "Email",
      "Access Control", "Printer", "Phone", "Other"
    )
    .required(),

  priority: Joi.string()
    .valid("Low", "Medium", "High", "Critical")
    .required(),

  department: Joi.string()
    .valid("Finance", "HR", "Operations", "Sales", "Marketing", "IT", "Legal")
    .required(),

  assignTo: Joi.string()
    .valid("Unassigned", "Mark Wilson", "James Chen", "Sarah Mitchell")
    .required(),

  description: Joi.string().required(),

  submittedBy: Joi.string().required(),   // NEW FIELD

  status: Joi.string()
    .valid("Open", "InProgress", "Resolved")   // NEW ENUM
    .default("Open"),
});

// UPDATE
export const updateSupportSchema: ObjectSchema = Joi.object({
  ticketTitle: Joi.string().optional(),

  category: Joi.string().valid(
    "Hardware", "Software", "Network", "Email",
    "Access Control", "Printer", "Phone", "Other"
  ).optional(),

  priority: Joi.string().valid("Low", "Medium", "High", "Critical").optional(),

  department: Joi.string()
    .valid("Finance", "HR", "Operations", "Sales", "Marketing", "IT", "Legal")
    .optional(),

  assignTo: Joi.string()
    .valid("Unassigned", "Mark Wilson", "James Chen", "Sarah Mitchell")
    .optional(),

  description: Joi.string().optional(),

  submittedBy: Joi.string().optional(),    // NEW

  status: Joi.string()
    .valid("Open", "InProgress", "Resolved")
    .optional(),                            // NEW
});

// LIST
export const getSupportListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),

  category: Joi.string().valid(
    "Hardware", "Software", "Network", "Email",
    "Access Control", "Printer", "Phone", "Other"
  ).optional(),

  priority: Joi.string().valid("Low", "Medium", "High", "Critical").optional(),

  department: Joi.string()
    .valid("Finance", "HR", "Operations", "Sales", "Marketing", "IT", "Legal")
    .optional(),

  status: Joi.string().valid("Open", "InProgress", "Resolved").optional(),

  orderBy: Joi.string()
    .valid(
      "ticketTitle",
      "category",
      "priority",
      "department",
      "assignTo",
      "submittedBy",
      "status",
      "createdAt",
      "updatedAt"
    )
    .default("createdAt"),

  sortBy: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});


// GET BY ID
export const getSupportByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
