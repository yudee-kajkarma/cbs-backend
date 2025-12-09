import { Request, Response } from "express";
import { networkEquipmentService } from "../services/network-equipment.service";
import { sendSuccess, sendCreated, sendError } from "../utils/response.util";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../utils/response.util";

const parseDDMMYYYY = (s?: string | null): Date | null => {
  if (!s) return null;
  const parts = s.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts.map(Number);
  return new Date(yyyy, mm - 1, dd);
};

class NetworkEquipmentController {
  // CREATE
  async create(req: Request, res: Response) {
    try {
      const body: any = { ...req.body };

      body.purchaseDate = parseDDMMYYYY(body.purchaseDate);
      body.warrantyExpiry = parseDDMMYYYY(body.warrantyExpiry);

      const duplicates: string[] = [];

      if (body.macAddress) {
        const macExists = await networkEquipmentService.findByMac(body.macAddress);
        if (macExists) duplicates.push("macAddress");
      }

      if (body.serialNumber) {
        const serialExists = await networkEquipmentService.findBySerial(body.serialNumber);
        if (serialExists) duplicates.push("serialNumber");
      }

      if (duplicates.length > 0) {
        return sendError(res, 409, "Duplicate values", { duplicates });
      }

      const created = await networkEquipmentService.create(body);

      return sendCreated(
        res,
        SUCCESS_MESSAGES?.NETWORK_EQUIPMENT_CREATED ?? "Network equipment created",
        created
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES?.INTERNAL_SERVER_ERROR ?? "Something went wrong",
        { error: err?.message ?? err }
      );
    }
  }

  // GET ALL
// GET ALL
async getAll(req: Request, res: Response) {
  try {
    const q: any = req.query || {};
    const page = Number(q.page || 1);
    const limit = Number(q.limit || 10);

    const filter: any = {};
    if (q.equipmentType) filter.equipmentType = q.equipmentType;
    if (q.status) filter.status = q.status;
    if (q.location) filter.location = { $regex: q.location, $options: "i" };

    // ⭐ Sorting parameters
    const orderBy = q.orderBy || "createdAt";
    const order = q.order === "desc" ? -1 : 1;

    const result = await networkEquipmentService.getAll(
      filter,
      page,
      limit,
      orderBy,
      order
    );

    return sendSuccess(
      res,
      SUCCESS_MESSAGES?.NETWORK_EQUIPMENT_LIST_FETCHED ?? "Network equipment list fetched",
      {
        networkEquipments: result.items,
        pagination: result.pagination
      }
    );
  } catch (err: any) {
    return sendError(
      res,
      500,
      ERROR_MESSAGES?.INTERNAL_SERVER_ERROR ?? "Something went wrong",
      { error: err?.message ?? err }
    );
  }
}


  // GET ONE
  async getOne(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const item = await networkEquipmentService.getById(id);

      if (!item) {
        return sendError(
          res,
          404,
          ERROR_MESSAGES?.NETWORK_EQUIPMENT_NOT_FOUND ?? "Network equipment not found"
        );
      }

      return sendSuccess(
        res,
        SUCCESS_MESSAGES?.NETWORK_EQUIPMENT_FETCHED ?? "Network equipment fetched",
        item
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES?.INTERNAL_SERVER_ERROR ?? "Something went wrong",
        { error: err?.message ?? err }
      );
    }
  }

  // UPDATE
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const body: any = { ...req.body };

      if (body.purchaseDate)
        body.purchaseDate = parseDDMMYYYY(body.purchaseDate);

      if (body.warrantyExpiry)
        body.warrantyExpiry = parseDDMMYYYY(body.warrantyExpiry);

      const duplicates: string[] = [];

      if (body.macAddress) {
        const macExists = await networkEquipmentService.findByMacExcludeId(body.macAddress, id);
        if (macExists) duplicates.push("macAddress");
      }

      if (body.serialNumber) {
        const serialExists = await networkEquipmentService.findBySerialExcludeId(body.serialNumber, id);
        if (serialExists) duplicates.push("serialNumber");
      }

      if (duplicates.length > 0) {
        return sendError(res, 409, "Duplicate values", { duplicates });
      }

      const updated = await networkEquipmentService.update(id, body);

      if (!updated) {
        return sendError(
          res,
          404,
          ERROR_MESSAGES?.NETWORK_EQUIPMENT_NOT_FOUND ?? "Network equipment not found"
        );
      }

      return sendSuccess(
        res,
        SUCCESS_MESSAGES?.NETWORK_EQUIPMENT_UPDATED ?? "Network equipment updated",
        updated
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES?.INTERNAL_SERVER_ERROR ?? "Something went wrong",
        { error: err?.message ?? err }
      );
    }
  }

  // DELETE
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const removed = await networkEquipmentService.delete(id);

      if (!removed) {
        return sendError(
          res,
          404,
          ERROR_MESSAGES?.NETWORK_EQUIPMENT_NOT_FOUND ?? "Network equipment not found"
        );
      }

      return sendSuccess(
        res,
        SUCCESS_MESSAGES?.NETWORK_EQUIPMENT_DELETED ?? "Network equipment deleted",
        removed
      );
    } catch (err: any) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES?.INTERNAL_SERVER_ERROR ?? "Something went wrong",
        { error: err?.message ?? err }
      );
    }
  }
}

export const networkEquipmentController = new NetworkEquipmentController();
