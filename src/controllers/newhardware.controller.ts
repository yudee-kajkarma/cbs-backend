import { Request, Response, NextFunction } from "express";
import { newHardwareService } from "../services/newhardware.service";
import { sendSuccess, sendCreated, sendError, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/response.util";

export const newHardwareController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await newHardwareService.create(req.body);
      return sendCreated(res, SUCCESS_MESSAGES.NEW_HARDWARE_CREATED, data);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "10", 10);
      const filters = {
        search: req.query.search,
        type: req.query.type,
        operatingSystem: req.query.operatingSystem,
        department: req.query.department,
        status: req.query.status,
        sort: req.query.sort,
        order: req.query.order,
      };


      const data = await newHardwareService.getAll(page, limit, filters);
      return sendSuccess(res, SUCCESS_MESSAGES.NEW_HARDWARE_LIST_FETCHED, data);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await newHardwareService.getById(req.params.id);
      if (!data) return sendError(res, 404, ERROR_MESSAGES.NEW_HARDWARE_NOT_FOUND);
      return sendSuccess(res, SUCCESS_MESSAGES.NEW_HARDWARE_FETCHED, data);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await newHardwareService.update(req.params.id, req.body);
      if (!data) return sendError(res, 404, ERROR_MESSAGES.NEW_HARDWARE_NOT_FOUND);
      return sendSuccess(res, SUCCESS_MESSAGES.NEW_HARDWARE_UPDATED, data);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await newHardwareService.delete(req.params.id);
      if (!deleted) return sendError(res, 404, ERROR_MESSAGES.NEW_HARDWARE_NOT_FOUND);
      return sendSuccess(res, SUCCESS_MESSAGES.NEW_HARDWARE_DELETED);
    } catch (error) {
      next(error);
    }
  },
};
