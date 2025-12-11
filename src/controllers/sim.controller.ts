import { Request, Response } from "express";
import { simService } from "../services/sim.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from "../utils/response.util";

// Convert "DD-MM-YYYY" → Date
const parseDDMMYYYY = (s?: string | null): Date | null => {
  if (!s) return null;

  const parts = s.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (!dd || !mm || !yyyy) return null;

  return new Date(yyyy, mm - 1, dd);
};

class SimController {
  // ---------- CREATE ----------
  async create(req: Request, res: Response) {
    try {
      const body = { ...req.body };

      if (body.activationDate)
        body.activationDate = parseDDMMYYYY(body.activationDate);

      if (body.expiryDate)
        body.expiryDate = parseDDMMYYYY(body.expiryDate);

      const sim = await simService.createSim(body);
      return sendCreated(res, SUCCESS_MESSAGES.SIM_CREATED, sim);
    } catch (err: any) {
      if (err?.code === 11000) {
        return sendError(res, 409, `SIM with same simNumber already exists.`);
      }
      return sendError(
        res,
        500,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err?.message ?? err
      );
    }
  }

  // ---------- GET ALL ----------
  async getAll(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        simNumber,
        phoneNumber,
        carrier,
        status,
        department,
        activationDate,
        expiryDate
      } = req.query as any;

      const filter: any = {};

      // Partial & case-insensitive search
      if (simNumber) filter.simNumber = { $regex: simNumber, $options: "i" };
      if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: "i" };

      if (carrier) filter.carrier = carrier;
      if (status) filter.status = status;
      if (department) filter.department = department;

      // Dates stored as string in DB → exact match filter
      if (activationDate) filter.activationDate = activationDate;
      if (expiryDate) filter.expiryDate = expiryDate;

      const data = await simService.getAllSims(
        filter,
        Number(page),
        Number(limit)
      );

      const pagination = {
        total: data.total,
        page: Number(page),
        limit: Number(limit),
        totalPages: data.totalPages,
        hasNextPage: Number(page) < data.totalPages,
        hasPrevPage: Number(page) > 1
      };

      return sendSuccess(res, SUCCESS_MESSAGES.SIM_LIST_FETCHED, {
        items: data.items,
        pagination
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

  // ---------- GET ONE ----------
  async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const sim = await simService.getSimById(id);

      if (!sim) return sendError(res, 404, ERROR_MESSAGES.SIM_NOT_FOUND);

      return sendSuccess(res, SUCCESS_MESSAGES.SIM_FETCHED, sim);
    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err?.message ?? err
      );
    }
  }

  // ---------- UPDATE ----------
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const body = { ...req.body };

      if (body.activationDate)
        body.activationDate = parseDDMMYYYY(body.activationDate);

      if (body.expiryDate)
        body.expiryDate = parseDDMMYYYY(body.expiryDate);

      const sim = await simService.updateSim(id, body);

      if (!sim) return sendError(res, 404, ERROR_MESSAGES.SIM_NOT_FOUND);

      return sendSuccess(res, SUCCESS_MESSAGES.SIM_UPDATED, sim);
    } catch (err: any) {
      if (err?.code === 11000) {
        return sendError(res, 409, `SIM with same simNumber already exists.`);
      }
      return sendError(
        res,
        500,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err?.message ?? err
      );
    }
  }

  // ---------- DELETE ----------
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const sim = await simService.deleteSim(id);

      if (!sim) return sendError(res, 404, ERROR_MESSAGES.SIM_NOT_FOUND);

      return sendSuccess(res, SUCCESS_MESSAGES.SIM_DELETED, sim);
    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err?.message ?? err
      );
    }
  }
}

export const simController = new SimController();
