import Joi from "joi";

import {
  TransferType,
  HardwareCondition,
  HardwareList,
  TransferUserList,
  TransferStatus,
} from "../constants";

// Base schema for reusability
const hardwareTransferBaseSchema = {
  hardwareName: Joi.string().valid(...Object.values(HardwareList)),
  serialNumber: Joi.string().trim(),
  fromUser: Joi.string().valid(...Object.values(TransferUserList)),
  toUser: Joi.string().valid(...Object.values(TransferUserList)),
  transferDate: Joi.date(),
  expectedReturnDate: Joi.date().allow(null),
  transferType: Joi.string().valid(...Object.values(TransferType)),
  hardwareCondition: Joi.string().valid(...Object.values(HardwareCondition)),
  transferReason: Joi.string().trim(),
  approvedBy: Joi.string().trim(),
  additionalNotes: Joi.string().trim(),
  status: Joi.string().valid(...Object.values(TransferStatus)),
};

// CREATE DTO
export const createHardwareTransferSchema = Joi.object({
  hardwareName: hardwareTransferBaseSchema.hardwareName.required(),
  serialNumber: hardwareTransferBaseSchema.serialNumber.required(),
  fromUser: hardwareTransferBaseSchema.fromUser.required(),
  toUser: hardwareTransferBaseSchema.toUser.required(),
  transferDate: hardwareTransferBaseSchema.transferDate.required(),
  expectedReturnDate: hardwareTransferBaseSchema.expectedReturnDate.optional(),
  transferType: hardwareTransferBaseSchema.transferType.required(),
  hardwareCondition: hardwareTransferBaseSchema.hardwareCondition.required(),
  transferReason: hardwareTransferBaseSchema.transferReason.optional(),
  approvedBy: hardwareTransferBaseSchema.approvedBy.optional(),
  additionalNotes: hardwareTransferBaseSchema.additionalNotes.optional(),
  status: hardwareTransferBaseSchema.status.optional(),
});

// UPDATE DTO
export const updateHardwareTransferSchema = Joi.object({
  hardwareName: hardwareTransferBaseSchema.hardwareName.optional(),
  serialNumber: hardwareTransferBaseSchema.serialNumber.optional(),
  fromUser: hardwareTransferBaseSchema.fromUser.optional(),
  toUser: hardwareTransferBaseSchema.toUser.optional(),
  transferDate: hardwareTransferBaseSchema.transferDate.optional(),
  expectedReturnDate: hardwareTransferBaseSchema.expectedReturnDate.optional(),
  transferType: hardwareTransferBaseSchema.transferType.optional(),
  hardwareCondition: hardwareTransferBaseSchema.hardwareCondition.optional(),
  transferReason: hardwareTransferBaseSchema.transferReason.optional(),
  approvedBy: hardwareTransferBaseSchema.approvedBy.optional(),
  additionalNotes: hardwareTransferBaseSchema.additionalNotes.optional(),
  status: hardwareTransferBaseSchema.status.optional(),
}).min(1);

// PARAMS DTO (/:id)
export const hardwareTransferIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

// QUERY DTO
export const hardwareTransferQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // Search and filters
  search: Joi.string().trim().optional(),
  hardwareName: Joi.string().valid(...Object.values(HardwareList)).optional(),
  fromUser: Joi.string().valid(...Object.values(TransferUserList)).optional(),
  toUser: Joi.string().valid(...Object.values(TransferUserList)).optional(),
  transferType: Joi.string().valid(...Object.values(TransferType)).optional(),
  hardwareCondition: Joi.string().valid(...Object.values(HardwareCondition)).optional(),
  status: Joi.string().valid(...Object.values(TransferStatus)).optional(),

  // Date filters
  transferDateFrom: Joi.date().optional(),
  transferDateTo: Joi.date().optional(),
  expectedReturnDateFrom: Joi.date().optional(),
  expectedReturnDateTo: Joi.date().optional(),

  // Sorting
  orderBy: Joi.string().valid(
    "hardwareName",
    "serialNumber",
    "fromUser",
    "toUser",
    "transferDate",
    "expectedReturnDate",
    "transferType",
    "hardwareCondition",
    "status",
    "createdAt",
    "updatedAt"
  ).optional(),
  sortBy: Joi.string().valid("asc", "desc").optional(),
});
