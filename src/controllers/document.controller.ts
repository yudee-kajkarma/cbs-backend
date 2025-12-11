import { Request, Response } from "express";
import * as DocumentService from "../services/document.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/response.util";
import { handleControllerError } from "../utils/error.util";

// ---------------------------------------------
// CREATE DOCUMENT
// ---------------------------------------------
export const create = async (req: Request, res: Response) => {
  try {
    const result = await DocumentService.create(req.body, req.file);

    return sendCreated(res, SUCCESS_MESSAGES.DOCUMENT_CREATED, {
      document: result,
    });
  } catch (error: any) {
    return handleControllerError(res, error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// ---------------------------------------------
// LIST DOCUMENTS WITH FILTER + PAGINATION
// ---------------------------------------------
export const list = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Collect filters
const filters = {
  search: req.query.search as string | undefined,
  name: req.query.name as string | undefined,
  category: req.query.category as string | undefined,
  status: req.query.status as string | undefined,
  orderBy: req.query.orderBy as string | undefined,
  sortBy: req.query.sortBy as string | undefined,
};


    // Call service
    const result = await DocumentService.getAll(page, limit, filters);

    return sendSuccess(res, SUCCESS_MESSAGES.DOCUMENT_LIST_FETCHED, {
      documents: result.documents,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return handleControllerError(res, error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// ---------------------------------------------
// GET SINGLE DOCUMENT
// ---------------------------------------------
export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const doc = await DocumentService.getOne(id);
    if (!doc) return sendError(res, 404, ERROR_MESSAGES.DOCUMENT_NOT_FOUND);

    return sendSuccess(res, SUCCESS_MESSAGES.DOCUMENT_FETCHED, {
      document: doc,
    });
  } catch (error: any) {
    return handleControllerError(res, error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// ---------------------------------------------
// UPDATE DOCUMENT
// ---------------------------------------------
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const updated = await DocumentService.update(id, req.body, req.file);
    if (!updated) return sendError(res, 404, ERROR_MESSAGES.DOCUMENT_NOT_FOUND);

    return sendSuccess(res, SUCCESS_MESSAGES.DOCUMENT_UPDATED, {
      document: updated,
    });
  } catch (error: any) {
    return handleControllerError(res, error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// ---------------------------------------------
// DELETE DOCUMENT
// ---------------------------------------------
// DELETE DOCUMENT
// ---------------------------------------------
export const remove = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const deleted = await DocumentService.remove(id);
    if (!deleted) return sendError(res, 404, ERROR_MESSAGES.DOCUMENT_NOT_FOUND);

    return sendSuccess(res, SUCCESS_MESSAGES.DOCUMENT_DELETED, {
      deleted: true,
    });
  } catch (error: any) {
    return handleControllerError(res, error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// ---------------------------------------------
// GET DOWNLOAD URL (Optimized endpoint)
// ---------------------------------------------
export const getDownloadUrl = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const url = await DocumentService.getDownloadUrl(id);
    if (!url) return sendError(res, 404, "Document or file not found");

    return sendSuccess(res, "Download URL generated successfully", {
      url,
      expiresIn: 900, // 15 minutes (default S3 expiry)
    });
  } catch (error: any) {
    return handleControllerError(res, error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};
