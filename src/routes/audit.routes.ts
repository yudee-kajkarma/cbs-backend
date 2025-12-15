import { Router } from "express";

import { AuditController } from "../controllers/audit.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  createAuditSchema,
  updateAuditSchema,
  auditIdSchema
} from "../validators/audit.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createAuditSchema),
  AuditController.create
);

// LIST
router.get("/", AuditController.getAll);

// GET BY ID
router.get(
  "/:id",
  validateParams(auditIdSchema),
  AuditController.getById
);

// UPDATE
router.put(
  "/:id",
  validateParams(auditIdSchema),
  validateRequest(updateAuditSchema),
  AuditController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(auditIdSchema),
  AuditController.delete
);

export default router;
