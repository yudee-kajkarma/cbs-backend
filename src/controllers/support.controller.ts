import { Request, Response, NextFunction } from "express";
import { supportService } from "../services/support.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/response.util";

export const supportController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supportService.create(req.body);
      return sendCreated(res, SUCCESS_MESSAGES.SUPPORT_CREATED, data);
    } catch (error: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        priority,
        department,
        status,
        orderBy,
        sortBy,
      } = req.query;

      const data = await supportService.getAll({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        category: category as string,
        priority: priority as string,
        department: department as string,
        status: status as string,
        orderBy: orderBy as string,
        sortBy: sortBy as "asc" | "desc",
      });

      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_LIST_FETCHED, data);
    } catch (error: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supportService.getById(req.params.id);
      if (!data) {
        return sendError(res, 404, ERROR_MESSAGES.SUPPORT_NOT_FOUND);
      }
      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_FETCHED, data);
    } catch (error: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supportService.update(req.params.id, req.body);
      if (!data) {
        return sendError(res, 404, ERROR_MESSAGES.SUPPORT_NOT_FOUND);
      }
      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_UPDATED, data);
    } catch (error: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await supportService.delete(req.params.id);
      if (!deleted) {
        return sendError(res, 404, ERROR_MESSAGES.SUPPORT_NOT_FOUND);
      }
      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_DELETED);
    } catch (error: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
    }
  },
};
