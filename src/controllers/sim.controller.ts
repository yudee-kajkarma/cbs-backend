import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { simService } from "../services/sim.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from "../utils/response.util";

class SimController {
  // ---------- CREATE ----------
  async create(req: Request, res: Response) {
    try {
      const sim = await simService.createSim(req.body);
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
        expiryDate,
        orderBy,
        sortBy
      } = req.query as any;

      const filter: FilterQuery<any> = {};

      // Partial & case-insensitive search
      if (simNumber) filter.simNumber = { $regex: simNumber, $options: "i" };
      if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: "i" };

      if (carrier) filter.carrier = carrier;
      if (status) filter.status = status;
      if (department) filter.department = department;

      // Dates stored as Date in DB
      if (activationDate) filter.activationDate = new Date(activationDate);
      if (expiryDate) filter.expiryDate = new Date(expiryDate);

      const result = await simService.getAllSims(
        filter,
        Number(page),
        Number(limit),
        orderBy,
        sortBy
      );

      return sendSuccess(res, SUCCESS_MESSAGES.SIM_LIST_FETCHED, {
        sims: result.items,
        pagination: result.pagination
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
      const sim = await simService.updateSim(id, req.body);

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
