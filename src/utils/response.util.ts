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

  // Audit
  AUDIT_CREATED: "Audit created successfully",
  AUDIT_LIST_FETCHED: "Audit list fetched successfully",
  AUDIT_FETCHED: "Audit fetched successfully",
  AUDIT_UPDATED: "Audit updated successfully",
  AUDIT_DELETED: "Audit deleted successfully",
};

// -------- ERROR MESSAGES --------
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Something went wrong",
  VALIDATION_FAILED: "Validation failed",
  INVALID_ID: "Invalid ID format",

  // License
  LICENSE_NOT_FOUND: "License not found",

  // Document
  DOCUMENT_NOT_FOUND: "Document not found",
  DOCUMENT_UPLOAD_FAILED: "Document upload failed",
  DOCUMENT_DELETE_FAILED: "Document delete failed",

  // Audit
  AUDIT_NOT_FOUND: "Audit not found",
  AUDIT_UPLOAD_FAILED: "Audit document upload failed",
  AUDIT_DELETE_FAILED: "Audit delete failed",
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
