import Joi, { ObjectSchema } from "joi";
import { 
  allowedSupportCategories, 
  allowedSupportAssignees, 
  allowedSupportStatuses 
} from "../constants/support.constants";
import { allowedPriorities, allowedDepartments } from "../constants/common.constants";

// CREATE
export const createSupportSchema: ObjectSchema = Joi.object({
  ticketTitle: Joi.string().required(),

  category: Joi.string()
    .valid(...allowedSupportCategories)
    .required(),

  priority: Joi.string()
    .valid(...allowedPriorities)
    .required(),

  department: Joi.string()
    .valid(...allowedDepartments)
    .required(),

  assignTo: Joi.string()
    .valid(...allowedSupportAssignees)
    .required(),

  description: Joi.string().required(),

  submittedBy: Joi.string().required(),   // NEW FIELD

  status: Joi.string()
    .valid(...allowedSupportStatuses)   // NEW ENUM
    .default("Open"),
});

// UPDATE
export const updateSupportSchema: ObjectSchema = Joi.object({
  ticketTitle: Joi.string().optional(),

  category: Joi.string()
    .valid(...allowedSupportCategories)
    .optional(),

  priority: Joi.string()
    .valid(...allowedPriorities)
    .optional(),

  department: Joi.string()
    .valid(...allowedDepartments)
    .optional(),

  assignTo: Joi.string()
    .valid(...allowedSupportAssignees)
    .optional(),

  description: Joi.string().optional(),

  submittedBy: Joi.string().optional(),    // NEW

  status: Joi.string()
    .valid(...allowedSupportStatuses)
    .optional(),                            // NEW
});

// LIST
export const getSupportListSchema: ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional(),

  category: Joi.string()
    .valid(...allowedSupportCategories)
    .optional(),

  priority: Joi.string()
    .valid(...allowedPriorities)
    .optional(),

  department: Joi.string()
    .valid(...allowedDepartments)
    .optional(),

  status: Joi.string()
    .valid(...allowedSupportStatuses)
    .optional(),

  sortBy: Joi.string()
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

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});


// GET BY ID
export const getSupportByIdSchema: ObjectSchema = Joi.object({
  id: Joi.string().length(24).required(),
});
