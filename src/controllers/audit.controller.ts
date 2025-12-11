import { Request, Response } from "express";
import * as AuditService from "../services/audit.service";
import {
  sendSuccess,
  sendCreated,
  sendError,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/response.util";

export const create = async (req: Request, res: Response) => {
  try {
    const audit = await AuditService.create(req.body, req.file);
    return sendCreated(res, SUCCESS_MESSAGES.AUDIT_CREATED, audit);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// LIST
export const list = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters = {
      search: req.query.search?.toString(),
      name: req.query.name?.toString(),
      type: req.query.type?.toString(),
      status: req.query.status?.toString(),
      auditor: req.query.auditor?.toString(),

      // Optional date filters
      periodStartFrom: req.query.periodStartFrom?.toString(),
      periodStartTo: req.query.periodStartTo?.toString(),
      periodEndFrom: req.query.periodEndFrom?.toString(),
      periodEndTo: req.query.periodEndTo?.toString(),
      completionFrom: req.query.completionFrom?.toString(),
      completionTo: req.query.completionTo?.toString(),
    };

    const result = await AuditService.getAll(page, limit, filters);

    return sendSuccess(res, SUCCESS_MESSAGES.AUDIT_LIST_FETCHED, result);

  } catch (error: any) {
    return sendError(
      res,
      500,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error?.message ?? error
    );
  }
};


export const getById = async (req: Request, res: Response) => {
  try {
    const audit = await AuditService.getOne(req.params.id);

    if (!audit) {
      return sendError(res, 404, ERROR_MESSAGES.AUDIT_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.AUDIT_FETCHED, audit);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const audit = await AuditService.update(req.params.id, req.body, req.file);

    if (!audit) {
      return sendError(res, 404, ERROR_MESSAGES.AUDIT_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.AUDIT_UPDATED, audit);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const deleteAudit = async (req: Request, res: Response) => {
  try {
    const removed = await AuditService.remove(req.params.id);

    if (!removed) {
      return sendError(res, 404, ERROR_MESSAGES.AUDIT_NOT_FOUND);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.AUDIT_DELETED);
  } catch (error: any) {
    return sendError(res, 500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, error.message);
  }
};
