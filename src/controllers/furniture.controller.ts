import { Request, Response, NextFunction } from "express";
import { furnitureService } from "../services/furniture.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/response.util";
import { FilterQuery, Types } from "mongoose";
import { IFurniture } from "../models/furniture.model";
import {
  createFurnitureSchema,
  updateFurnitureSchema,
  getFurnitureListSchema,
  getFurnitureByIdSchema,
} from "../dto/furniture.dto";

const validateObjectId = (id: string) => Types.ObjectId.isValid(id);

const parseQueryFilters = (query: any): FilterQuery<IFurniture> => {
  const filters: any = {};
  if (query.search) {
    const rx = new RegExp(query.search as string, "i");
    filters.$or = [{ itemName: rx }, { itemCode: rx }, { location: rx }];
  }
  if (query.category) filters.category = query.category;
  if (query.status) filters.status = query.status;
  if (query.location) filters.location = query.location;
  return filters;
};

const handleDuplicateItemCode = (err: any, res: Response) => {
  if (err.code === 11000 && (err.keyPattern?.itemCode || err.keyValue?.itemCode)) {
    return sendError(res, 400, ERROR_MESSAGES.ITEMCODE_EXISTS);
  }
  return null;
};

const dateFields = ["purchaseDate", "warrantyExpiry", "lastInspection"];
const hasInvalidDate = (body: any) => {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  for (const f of dateFields) {
    if (body[f] && !regex.test(body[f])) return true;
  }
  return false;
};

export const furnitureController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = createFurnitureSchema.validate(req.body);
      if (error) return sendError(res, 400, error.details[0].message);
      if (hasInvalidDate(req.body)) return sendError(res, 400, ERROR_MESSAGES.INVALID_DATE_FORMAT);
      const data = await furnitureService.create(req.body);
      return sendCreated(res, SUCCESS_MESSAGES.FURNITURE_CREATED, data);
    } catch (err: any) {
      const dup = handleDuplicateItemCode(err, res);
      if (dup) return dup;
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = getFurnitureListSchema.validate(req.query);
      if (error) return sendError(res, 400, error.details[0].message);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = parseQueryFilters(req.query);
      const data = await furnitureService.getAll(page, limit, filters);
      return sendSuccess(res, SUCCESS_MESSAGES.FURNITURE_LIST_FETCHED, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = getFurnitureByIdSchema.validate(req.params);
      if (error) return sendError(res, 400, error.details[0].message);
      if (!validateObjectId(req.params.id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);
      const data = await furnitureService.getById(req.params.id);
      if (!data) return sendError(res, 404, ERROR_MESSAGES.FURNITURE_NOT_FOUND);
      return sendSuccess(res, SUCCESS_MESSAGES.FURNITURE_FETCHED, data);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = updateFurnitureSchema.validate(req.body);
      if (error) return sendError(res, 400, error.details[0].message);
      if (!validateObjectId(req.params.id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);
      if (hasInvalidDate(req.body)) return sendError(res, 400, ERROR_MESSAGES.INVALID_DATE_FORMAT);
      const data = await furnitureService.update(req.params.id, req.body);
      if (!data) return sendError(res, 404, ERROR_MESSAGES.FURNITURE_NOT_FOUND);
      return sendSuccess(res, SUCCESS_MESSAGES.FURNITURE_UPDATED, data);
    } catch (err: any) {
      const dup = handleDuplicateItemCode(err, res);
      if (dup) return dup;
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!validateObjectId(req.params.id)) return sendError(res, 400, ERROR_MESSAGES.INVALID_ID);
      const deleted = await furnitureService.delete(req.params.id);
      if (!deleted) return sendError(res, 404, ERROR_MESSAGES.FURNITURE_NOT_FOUND);
      return sendSuccess(res, SUCCESS_MESSAGES.FURNITURE_DELETED);
    } catch (err) {
      next(err);
    }
  },
};
