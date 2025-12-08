import { Response } from "express";

// ---------------- SUCCESS MESSAGES ----------------
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

  // ISO
  ISO_CREATED: "ISO document created successfully",
  ISO_LIST_FETCHED: "ISO document list fetched successfully",
  ISO_FETCHED: "ISO document fetched successfully",
  ISO_UPDATED: "ISO document updated successfully",
  ISO_DELETED: "ISO document deleted successfully",

  // 🔥 Furniture (MOVE HERE)
  FURNITURE_CREATED: "Furniture item created successfully",
  FURNITURE_LIST_FETCHED: "Furniture list fetched successfully",
  FURNITURE_FETCHED: "Furniture fetched successfully",
  FURNITURE_UPDATED: "Furniture updated successfully",
  FURNITURE_DELETED: "Furniture deleted successfully",
};

// ---------------- ERROR MESSAGES ----------------
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

  // Furniture
  FURNITURE_NOT_FOUND: "Furniture item not found",
  ITEMCODE_EXISTS: "Item code already exists",
  INVALID_DATE_FORMAT: "Invalid date format. Use DD-MM-YYYY",

  // ISO
  ISO_NOT_FOUND: "ISO document not found",
  ISO_UPLOAD_FAILED: "ISO document upload failed",
  ISO_DELETE_FAILED: "ISO document delete failed",
};

// ---------------- RESPONSE HELPERS ----------------
export const sendSuccess = (res: Response, message: string, data: any = null) => {
  return res.status(200).json({ success: true, statusCode: 200, message, data });
};

export const sendCreated = (res: Response, message: string, data: any = null) => {
  return res.status(201).json({ success: true, statusCode: 201, message, data });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
  });
};

export const throwJoiValidationError = (message: string) => {
  const error: any = new Error(message);
  error.type = "JoiValidationError";
  error.statusCode = 400;
  return error;
};
