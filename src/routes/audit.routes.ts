import { Router } from "express";

import { AuditController } from "../controllers/audit.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  createAuditDto,
  updateAuditDto,
  auditIdDto
} from "../validators/audit.dto";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createAuditDto),
  AuditController.create
);

// LIST
router.get("/", AuditController.getAll);

// GET BY ID
router.get(
  "/:id",
  validateParams(auditIdDto),
  AuditController.getById
);

// UPDATE
router.put(
  "/:id",
  validateParams(auditIdDto),
  validateRequest(updateAuditDto),
  AuditController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(auditIdDto),
  AuditController.delete
);

export default router;
