import { Router } from "express";
import multer from "multer";

import * as AuditController from "../controllers/audit.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  createAuditDto,
  updateAuditDto,
  auditIdDto
} from "../dto/audit.dto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post(
  "/",
  upload.single("file"),
  validateRequest(createAuditDto),
  AuditController.create
);

// LIST
router.get("/", AuditController.list);

// GET BY ID
router.get(
  "/:id",
  validateParams(auditIdDto),
  AuditController.getById
);

// UPDATE
router.put(
  "/:id",
  upload.single("file"),
  validateParams(auditIdDto),
  validateRequest(updateAuditDto),
  AuditController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(auditIdDto),
  AuditController.deleteAudit
);

export default router;
