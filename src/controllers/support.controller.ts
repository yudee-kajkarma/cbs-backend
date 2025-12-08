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
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const data = await supportService.getAll(page, limit);
      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_LIST_FETCHED, data);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supportService.getById(req.params.id);
      if (!data)
        return sendError(res, 404, ERROR_MESSAGES.SUPPORT_NOT_FOUND);

      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_FETCHED, data);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supportService.update(req.params.id, req.body);
      if (!data)
        return sendError(res, 404, ERROR_MESSAGES.SUPPORT_NOT_FOUND);

      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_UPDATED, data);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await supportService.delete(req.params.id);
      if (!deleted)
        return sendError(res, 404, ERROR_MESSAGES.SUPPORT_NOT_FOUND);

      return sendSuccess(res, SUCCESS_MESSAGES.SUPPORT_DELETED);
    } catch (error) {
      next(error);
    }
  },
};
