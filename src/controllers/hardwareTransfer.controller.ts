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
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const filters = {
        search: req.query.search,
        hardwareName: req.query.hardwareName,
        fromUser: req.query.fromUser,
        toUser: req.query.toUser,
        transferType: req.query.transferType,
        hardwareCondition: req.query.hardwareCondition,
        status: req.query.status,
        transferDateFrom: req.query.transferDateFrom,
        transferDateTo: req.query.transferDateTo,
        expectedReturnDateFrom: req.query.expectedReturnDateFrom,
        expectedReturnDateTo: req.query.expectedReturnDateTo,
      };

      const { hardwareTransfers, pagination } = await service.list(
        page,
        limit,
        filters,
        req.query.orderBy as string,
        req.query.sortBy as string
      );

      return sendSuccess(
        res,
        SUCCESS_MESSAGES.HARDWARE_TRANSFER_LIST_FETCHED,
        { hardwareTransfers, pagination }
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
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
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
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }
}
