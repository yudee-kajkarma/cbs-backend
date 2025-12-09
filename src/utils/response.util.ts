import { Response } from "express";

// -------- SUCCESS MESSAGES --------
export const SUCCESS_MESSAGES = {
  // License
  LICENSE_CREATED: "License created successfully",
  LICENSE_LIST_FETCHED: "License list fetched successfully",
  LICENSE_FETCHED: "License fetched successfully",
  LICENSE_UPDATED: "License updated successfully",
  LICENSE_DELETED: "License deleted successfully",

  // Document
  DOCUMENT_CREATED: "Document created successfully",
  DOCUMENT_LIST_FETCHED: "Document list fetched successfully",
  DOCUMENT_FETCHED: "Document fetched successfully",
  DOCUMENT_UPDATED: "Document updated successfully",
  DOCUMENT_DELETED: "Document deleted successfully",



  // Support
SUPPORT_CREATED: "Support ticket created successfully",
SUPPORT_LIST_FETCHED: "Support ticket list fetched successfully",
SUPPORT_FETCHED: "Support ticket fetched successfully",
SUPPORT_UPDATED: "Support ticket updated successfully",
SUPPORT_DELETED: "Support ticket deleted successfully",

  // ISO
  ISO_CREATED: "ISO document created successfully",
  ISO_LIST_FETCHED: "ISO document list fetched successfully",
  ISO_FETCHED: "ISO document fetched successfully",
  ISO_UPDATED: "ISO document updated successfully",
  ISO_DELETED: "ISO document deleted successfully",

  // Hardware (NEW)
  HARDWARE_CREATED: "Hardware ticket created successfully",
  HARDWARE_LIST_FETCHED: "Hardware ticket list fetched successfully",
  HARDWARE_FETCHED: "Hardware ticket fetched successfully",
  HARDWARE_UPDATED: "Hardware ticket updated successfully",
  HARDWARE_DELETED: "Hardware ticket deleted successfully",
};

// -------- ERROR MESSAGES --------
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Something went wrong",
  VALIDATION_FAILED: "Validation failed",
  INVALID_ID: "Invalid ID format",
SUPPORT_NOT_FOUND: "Support ticket not found",

  // License
  LICENSE_NOT_FOUND: "License not found",

  // Document
  DOCUMENT_NOT_FOUND: "Document not found",
  DOCUMENT_UPLOAD_FAILED: "Document upload failed",
  DOCUMENT_DELETE_FAILED: "Document delete failed",

  // ISO
  ISO_NOT_FOUND: "ISO document not found",
  ISO_UPLOAD_FAILED: "ISO upload failed",
  ISO_DELETE_FAILED: "ISO delete failed",

  // Hardware (NEW)
  HARDWARE_NOT_FOUND: "Hardware ticket not found",
};

// -------- SUCCESS (200) --------
export const sendSuccess = (
  res: Response,
  message: string,
  data: any = null
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// -------- CREATED (201) --------

export const sendCreated = (
  res: Response,
  message: string,
  data: any = null
) => {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// -------- ERROR (custom status) --------

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  });
};


// -------- JOI VALIDATION ERROR THROWER --------
export const throwJoiValidationError = (message: string) => {
  const error: any = new Error(message);
  error.type = "JoiValidationError";
  error.statusCode = 400;
  return error;
};
