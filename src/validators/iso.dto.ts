import Joi from "joi";
import { allowedISOStandards } from "../constants/iso.constants";

const isoBaseSchema = {
  certificateName: Joi.string(),
  isoStandard: Joi.string().valid(...allowedISOStandards),
  issueDate: Joi.date(),
  expiryDate: Joi.date(),
  certifyingBody: Joi.string(),
  fileKey: Joi.string(),
};

export const createISODto = Joi.object({
  certificateName: isoBaseSchema.certificateName.required(),
  isoStandard: isoBaseSchema.isoStandard.required(),
  issueDate: isoBaseSchema.issueDate.required(),
  expiryDate: isoBaseSchema.expiryDate.required(),
  certifyingBody: isoBaseSchema.certifyingBody.required(),
  fileKey: isoBaseSchema.fileKey.required(),
});

export const updateISODto = Joi.object({
  certificateName: isoBaseSchema.certificateName.optional(),
  isoStandard: isoBaseSchema.isoStandard.optional(),
  issueDate: isoBaseSchema.issueDate.optional(),
  expiryDate: isoBaseSchema.expiryDate.optional(),
  certifyingBody: isoBaseSchema.certifyingBody.optional(),
  fileKey: isoBaseSchema.fileKey.optional(),
}).min(1);

export const isoIdDto = Joi.object({
  id: Joi.string().length(24).hex().required(),
});

export const isoQueryDto = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),

  certificateName: Joi.string().optional(),
  isoStandard: Joi.string().optional(),
  certifyingBody: Joi.string().optional(),

  issueDateFrom: Joi.date().optional(),
  issueDateTo: Joi.date().optional(),

  expiryDateFrom: Joi.date().optional(),
  expiryDateTo: Joi.date().optional(),

  status: Joi.string().valid("Active", "Expired", "Expiring Soon").optional(),

  // ✅ Added sorting controls
  orderBy: Joi.string().valid(
    "certificateName",
    "isoStandard",
    "certifyingBody",
    "issueDate",
    "expiryDate",
    "status",
    "createdAt",
    "updatedAt"
  ).optional(),

  sortBy: Joi.string().valid("asc", "desc").optional()
});

