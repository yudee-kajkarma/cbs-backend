import { Response } from "express";

// -------- SUCCESS MESSAGES --------
export const SUCCESS_MESSAGES = {
  LICENSE_CREATED: "License created successfully",
  LICENSE_LIST_FETCHED: "License list fetched successfully",
  LICENSE_FETCHED: "License fetched successfully",
  LICENSE_UPDATED: "License updated successfully",
  LICENSE_DELETED: "License deleted successfully",

  // -------- SOFTWARE MESSAGES --------
  SOFTWARE_CREATED: "Software created successfully",
  SOFTWARE_LIST_FETCHED: "Software list fetched successfully",
  SOFTWARE_FETCHED: "Software fetched successfully",
  SOFTWARE_UPDATED: "Software updated successfully",
  SOFTWARE_DELETED: "Software deleted successfully",


  DOCUMENT_CREATED: "Document created successfully",
  DOCUMENT_LIST_FETCHED: "Document list fetched successfully",
  DOCUMENT_FETCHED: "Document fetched successfully",
  DOCUMENT_UPDATED: "Document updated successfully",
  DOCUMENT_DELETED: "Document deleted successfully",

  // New Hardware
  NEW_HARDWARE_CREATED: "New hardware created successfully",
  NEW_HARDWARE_LIST_FETCHED: "New hardware list fetched successfully",
  NEW_HARDWARE_FETCHED: "New hardware fetched successfully",
  NEW_HARDWARE_UPDATED: "New hardware updated successfully",
  NEW_HARDWARE_DELETED: "New hardware deleted successfully",



  // Support
  SUPPORT_CREATED: "Support ticket created successfully",
  SUPPORT_LIST_FETCHED: "Support ticket list fetched successfully",
  SUPPORT_FETCHED: "Support ticket fetched successfully",
  SUPPORT_UPDATED: "Support ticket updated successfully",
  SUPPORT_DELETED: "Support ticket deleted successfully",



  ISO_CREATED: "ISO document created successfully",
  ISO_LIST_FETCHED: "ISO document list fetched successfully",
  ISO_FETCHED: "ISO document fetched successfully",
  ISO_UPDATED: "ISO document updated successfully",
  ISO_DELETED: "ISO document deleted successfully",

  // -------- HARDWARE TRANSFER --------
  HARDWARE_TRANSFER_CREATED: "Hardware transfer created successfully",
  HARDWARE_TRANSFER_LIST_FETCHED: "Hardware transfer list fetched successfully",
  HARDWARE_TRANSFER_FETCHED: "Hardware transfer fetched successfully",
  HARDWARE_TRANSFER_UPDATED: "Hardware transfer updated successfully",
  HARDWARE_TRANSFER_DELETED: "Hardware transfer deleted successfully",

  // Network Equipment
  NETWORK_EQUIPMENT_CREATED: "Network equipment created successfully",
  NETWORK_EQUIPMENT_LIST_FETCHED: "Network equipment list fetched successfully",
  NETWORK_EQUIPMENT_FETCHED: "Network equipment fetched successfully",
  NETWORK_EQUIPMENT_UPDATED: "Network equipment updated successfully",
  NETWORK_EQUIPMENT_DELETED: "Network equipment deleted successfully",
};

// -------- ERROR MESSAGES --------
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Something went wrong",
  VALIDATION_FAILED: "Validation failed",
  INVALID_ID: "Invalid ID format",
  SUPPORT_NOT_FOUND: "Support ticket not found",
  INVALID_DATE_FORMAT: "Invalid date format. Use DD-MM-YYYY",

  LICENSE_NOT_FOUND: "License not found",

  // -------- SOFTWARE ERRORS --------
  SOFTWARE_NOT_FOUND: "Software not found",
  LICENSE_KEY_EXISTS: "License key already exists",   // <-- Added here

  // Document
  DOCUMENT_NOT_FOUND: "Document not found",
  DOCUMENT_UPLOAD_FAILED: "Document upload failed",
  DOCUMENT_DELETE_FAILED: "Document delete failed",

  ISO_NOT_FOUND: "ISO document not found",
  ISO_UPLOAD_FAILED: "ISO upload failed",
  ISO_DELETE_FAILED: "ISO delete failed",

  // Network Equipment
  NETWORK_EQUIPMENT_NOT_FOUND: "Network equipment not found",
  NETWORK_EQUIPMENT_EXISTS: "Network equipment already exists",

  // Hardware (NEW)
  HARDWARE_NOT_FOUND: "Hardware ticket not found",
};

// -------- SUCCESS (200) --------
export const sendSuccess = (res: Response, message: string, data: any = null) => {
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


// -------- JOI VALIDATION ERROR --------
export const throwJoiValidationError = (message: string) => {
  const error: any = new Error(message);
  error.type = "JoiValidationError";
  error.statusCode = 400;
  return error;
};
