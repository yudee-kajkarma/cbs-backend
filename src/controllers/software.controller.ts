import { Request, Response } from "express";
import { softwareService } from "../services/software.service";
import { sendSuccess, sendCreated, sendError } from "../utils/response.util";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../utils/response.util";

// -------- DATE FORMAT VALIDATION --------
const isValidDDMMYYYY = (s?: string | null): boolean => {
  if (!s) return true;
  const regex = /^([0-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4}$/;
  return regex.test(s);
};

const hasInvalidDate = (body: any) => {
  return (
    (body.purchaseDate && !isValidDDMMYYYY(body.purchaseDate)) ||
    (body.expiryDate && !isValidDDMMYYYY(body.expiryDate))
  );
};

const parseDDMMYYYY = (s?: string | null): Date | null => {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
};

// -------- CONTROLLER --------
class SoftwareController {
  async create(req: Request, res: Response) {
    try {
      if (hasInvalidDate(req.body)) {
        return sendError(res, 400, ERROR_MESSAGES.INVALID_DATE_FORMAT);
      }

      const body: any = { ...req.body };

      if (body.purchaseDate) body.purchaseDate = parseDDMMYYYY(body.purchaseDate);
      if (body.expiryDate) body.expiryDate = parseDDMMYYYY(body.expiryDate);

      const created = await softwareService.createSoftware(body);

      return res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.SOFTWARE_CREATED,
        data: created,
        timestamp: new Date().toISOString()   // ✅ added
      });

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

    // ⭐⭐⭐ ADD SORTING HERE ⭐⭐⭐
    const sort: any = {};
    if (q.orderBy) {
      sort[q.orderBy] = q.sortBy === "desc" ? -1 : 1;
    } else {
      sort["createdAt"] = -1; // default sort
    }

    const result = await softwareService.getAll(filter, page, limit, sort);

    return res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.SOFTWARE_LIST_FETCHED,
      data: result,
      timestamp: new Date().toISOString(),
    });
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

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: SUCCESS_MESSAGES.SOFTWARE_FETCHED,
        data: item,
        timestamp: new Date().toISOString()   // already added before
      });

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
      if (hasInvalidDate(req.body)) {
        return sendError(res, 400, ERROR_MESSAGES.INVALID_DATE_FORMAT);
      }

      const id = req.params.id;
      const body: any = { ...req.body };

      if (body.purchaseDate) body.purchaseDate = parseDDMMYYYY(body.purchaseDate);
      if (body.expiryDate) body.expiryDate = parseDDMMYYYY(body.expiryDate);

      const updated = await softwareService.updateSoftware(id, body);

      if (!updated) {
        return sendError(res, 404, ERROR_MESSAGES.SOFTWARE_NOT_FOUND);
      }

      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.SOFTWARE_UPDATED,
        data: updated,
        timestamp: new Date().toISOString()   // ✅ added
      });

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

      return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.SOFTWARE_DELETED,
        data: removed,
        timestamp: new Date().toISOString()   // ✅ added
      });

    } catch (err: any) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err?.message ?? err);
    }
  }
}

export const softwareController = new SoftwareController();
