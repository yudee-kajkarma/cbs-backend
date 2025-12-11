import { Request, Response } from "express";
import * as ISOService from "../services/iso.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/response.util";

export const create = async (req: Request, res: Response) => {
  try {
    const iso = await ISOService.create(req.body, req.file);
    return sendCreated(res, SUCCESS_MESSAGES.ISO_CREATED, iso);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await ISOService.getAll(page, limit, req.query);

    return sendSuccess(res, SUCCESS_MESSAGES.ISO_LIST_FETCHED, result);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const getOne = async (req: Request, res: Response) => {
  try {
    const iso = await ISOService.getOne(req.params.id);

    if (!iso) {
      return sendError(res, 404, ERROR_MESSAGES.ISO_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.ISO_FETCHED, iso);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const iso = await ISOService.update(req.params.id, req.body, req.file);

    if (!iso) {
      return sendError(res, 404, ERROR_MESSAGES.ISO_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.ISO_UPDATED, iso);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const deleted = await ISOService.remove(req.params.id);

    if (!deleted) {
      return sendError(res, 404, ERROR_MESSAGES.ISO_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.ISO_DELETED);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};
