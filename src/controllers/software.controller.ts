import { Request, Response } from "express";
import { softwareService } from "../services/software.service";
import { sendSuccess, sendCreated, sendError } from "../utils/response.util";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../utils/response.util";

// -------- CONTROLLER --------
class SoftwareController {
  async create(req: Request, res: Response) {
    try {
      const created = await softwareService.createSoftware(req.body);

      return sendCreated(res, SUCCESS_MESSAGES.SOFTWARE_CREATED, created);

    } catch (err: any) {
      if (err?.code === 11000 && err.keyValue?.licenseKey) {
        return sendError(res, 409, ERROR_MESSAGES.LICENSE_KEY_EXISTS);
      }

      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err?.message ?? err);
    }
  }

// ==============================
//        GET ALL + FILTER
// ==============================
async getAll(req: Request, res: Response) {
  try {
    const q = res.locals.validatedQuery || req.query;

    const page = Number(q.page || 1);
    const limit = Number(q.limit || 10);

    const filter: any = {};

    // BASIC FILTERS
    if (q.licenseType) filter.licenseType = q.licenseType;
    if (q.assignedDepartment) filter.assignedDepartment = q.assignedDepartment;
    if (q.status) filter.status = q.status;

    // STRING SEARCH
    if (q.vendor) {
      filter.vendor = { $regex: q.vendor, $options: "i" };
    }

    // DATE FILTERS
    if (q.purchaseDate) {
      const date = new Date(q.purchaseDate);
      filter.purchaseDate = { $gte: date, $lt: new Date(date.getTime() + 86400000) };
    }

    if (q.expiryDate) {
      const date = new Date(q.expiryDate);
      filter.expiryDate = { $gte: date, $lt: new Date(date.getTime() + 86400000) };
    }

    const result = await softwareService.getAll(
      filter,
      page,
      limit,
      q.orderBy,
      q.sortBy
    );

    return sendSuccess(res, SUCCESS_MESSAGES.SOFTWARE_LIST_FETCHED, result);
  } catch (err: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err?.message ?? err);
  }
}


  async getOne(req: Request, res: Response) {
    try {
      const item = await softwareService.getById(req.params.id);

      if (!item) {
        return sendError(res, 404, ERROR_MESSAGES.SOFTWARE_NOT_FOUND);
      }

      return sendSuccess(res, SUCCESS_MESSAGES.SOFTWARE_FETCHED, item);

    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err?.message ?? err
      );
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updated = await softwareService.updateSoftware(id, req.body);

      if (!updated) {
        return sendError(res, 404, ERROR_MESSAGES.SOFTWARE_NOT_FOUND);
      }

      return sendSuccess(res, SUCCESS_MESSAGES.SOFTWARE_UPDATED, updated);

    } catch (err: any) {
      if (err?.code === 11000 && err.keyValue?.licenseKey) {
        return sendError(res, 409, ERROR_MESSAGES.LICENSE_KEY_EXISTS);
      }

      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err?.message ?? err);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const removed = await softwareService.deleteSoftware(req.params.id);

      if (!removed) {
        return sendError(res, 404, ERROR_MESSAGES.SOFTWARE_NOT_FOUND);
      }

      return sendSuccess(res, SUCCESS_MESSAGES.SOFTWARE_DELETED, removed);

    } catch (err: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err?.message ?? err);
    }
  }
}

export const softwareController = new SoftwareController();
