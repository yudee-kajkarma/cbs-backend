import { Request, Response } from "express";
import License from "../models/license.model";
import * as LicenseService from "../services/license.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/response.util";

// ------------------ CREATE ------------------
export const create = async (req: Request, res: Response) => {
  try {
    const result = await LicenseService.create(req.body, req.file);
    return sendCreated(res, SUCCESS_MESSAGES.LICENSE_CREATED, result);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ------------------ GET ALL ------------------
// ------------------ GET ALL ------------------
export const getAll = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters = {
      search: req.query.search || "",
      type: req.query.type || "",
      name: req.query.name || "",
      status: req.query.status || "",
    };

    // NEW — sorting
    const orderBy = (req.query.orderBy as string) || "createdAt";
    const sortBy = (req.query.sortBy as string) || "desc";

    const result = await LicenseService.getAll(page, limit, filters, orderBy, sortBy);

    return sendSuccess(res, SUCCESS_MESSAGES.LICENSE_LIST_FETCHED, {
      licenses: result.licenses,
      pagination: result.pagination,
    });

  } catch (error: any) {
    return sendError(
      res,
      500,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};



// ------------------ GET ONE ------------------
export const getOne = async (req: Request, res: Response) => {
  try {
    const result = await LicenseService.getOne(req.params.id);

    if (!result) {
      return sendError(res, 404, ERROR_MESSAGES.LICENSE_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.LICENSE_FETCHED, result);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ------------------ UPDATE ------------------
export const update = async (req: Request, res: Response) => {
  try {
    const result = await LicenseService.update(req.params.id, req.body, req.file);

    if (!result) {
      return sendError(res, 404, ERROR_MESSAGES.LICENSE_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.LICENSE_UPDATED, result);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ------------------ DELETE ------------------
export const remove = async (req: Request, res: Response) => {
  try {
    const result = await LicenseService.remove(req.params.id);

    if (!result) {
      return sendError(res, 404, ERROR_MESSAGES.LICENSE_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.LICENSE_DELETED);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};