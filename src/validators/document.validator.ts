import Joi from "joi";
import { allowedDocumentCategories } from "../constants/document.constants";

export const createDocumentSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string()
    .valid(...allowedDocumentCategories)
    .required(),
  documentDate: Joi.date().required(),
  partiesInvolved: Joi.string().required(),
  fileKey: Joi.string().optional(), 
});

export const updateDocumentSchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().valid(...allowedDocumentCategories).optional(),
  documentDate: Joi.date().optional(),
  partiesInvolved: Joi.string().optional(),
  fileKey: Joi.string().optional(),
});

export const getDocumentByIdSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
});
// Query params for listing documents
export const listDocumentQuerySchema = Joi.object({
  search: Joi.string().optional(),
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  status: Joi.string().valid("Active", "Archived").optional(),

  // Sorting fields
  sortBy: Joi.string().valid(
    "name",
    "category",
    "createdAt",
    "updatedAt"
  ).optional(),


  sortOrder: Joi.string().valid("asc", "desc").optional(),

  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

