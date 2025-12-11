import { Request, Response, NextFunction } from "express";
import { HardwareTransferService } from "../services/hardwareTransfer.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/response.util";

const service = new HardwareTransferService();

export class HardwareTransferController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await service.create(req.body);

      return sendCreated(
        res,
        SUCCESS_MESSAGES.HARDWARE_TRANSFER_CREATED,
        created
      );
    } catch (err) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES.HARDWARE_TRANSFER_SAVE_FAILED,
        err
      );
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await service.list(page, limit, {});

      return sendSuccess(
        res,
        SUCCESS_MESSAGES.HARDWARE_TRANSFER_LIST_FETCHED,
        result
      );
    } catch (err) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await service.getById(req.params.id);

      if (!item)
        return sendError(
          res,
          404,
          ERROR_MESSAGES.HARDWARE_TRANSFER_NOT_FOUND
        );

      return sendSuccess(
        res,
        SUCCESS_MESSAGES.HARDWARE_TRANSFER_FETCHED,
        item
      );
    } catch (err) {
      return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await service.update(req.params.id, req.body);

      if (!updated)
        return sendError(
          res,
          404,
          ERROR_MESSAGES.HARDWARE_TRANSFER_NOT_FOUND
        );

      return sendSuccess(
        res,
        SUCCESS_MESSAGES.HARDWARE_TRANSFER_UPDATED,
        updated
      );
    } catch (err) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES.HARDWARE_TRANSFER_UPDATE_FAILED,
        err
      );
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await service.delete(req.params.id);

      if (!deleted)
        return sendError(
          res,
          404,
          ERROR_MESSAGES.HARDWARE_TRANSFER_NOT_FOUND
        );

      return sendSuccess(
        res,
        SUCCESS_MESSAGES.HARDWARE_TRANSFER_DELETED
      );
    } catch (err) {
      return sendError(
        res,
        500,
        ERROR_MESSAGES.HARDWARE_TRANSFER_DELETE_FAILED,
        err
      );
    }
  }
}
