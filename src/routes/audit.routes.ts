import { Router } from "express";

import { AuditController } from "../controllers/audit.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createAuditSchema,
  updateAuditSchema,
  auditIdSchema
} from "../validators/audit.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("company_documents", "audit", PERMISSIONS.WRITE),
  validateRequest(createAuditSchema),
  AuditController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("company_documents", "audit", PERMISSIONS.READ),
  AuditController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("company_documents", "audit", PERMISSIONS.READ),
  validateParams(auditIdSchema),
  AuditController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("company_documents", "audit", PERMISSIONS.WRITE),
  validateParams(auditIdSchema),
  validateRequest(updateAuditSchema),
  AuditController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("company_documents", "audit", PERMISSIONS.WRITE),
  validateParams(auditIdSchema),
  AuditController.delete
);

export default router;
