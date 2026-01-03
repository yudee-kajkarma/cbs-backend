import { Router } from "express";

import { DocumentController } from "../controllers/document.controller";

import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";

import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createDocumentSchema,
  updateDocumentSchema,
  getDocumentByIdSchema,
  listDocumentQuerySchema,
} from "../validators/document.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("company_documents", "legal_docs", PERMISSIONS.WRITE),
  validateRequest(createDocumentSchema),
  DocumentController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("company_documents", "legal_docs", PERMISSIONS.READ),
  validateQuery(listDocumentQuerySchema),
  DocumentController.getAll
);

// DOWNLOAD URL - Requires READ permission
router.get(
  "/:id/download-url",
  authenticate,
  checkPermission("company_documents", "legal_docs", PERMISSIONS.READ),
  validateParams(getDocumentByIdSchema),
  DocumentController.getDownloadUrl
);

// GET ONE - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("company_documents", "legal_docs", PERMISSIONS.READ),
  validateParams(getDocumentByIdSchema),
  DocumentController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("company_documents", "legal_docs", PERMISSIONS.WRITE),
  validateParams(getDocumentByIdSchema),
  validateRequest(updateDocumentSchema),
  DocumentController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("company_documents", "legal_docs", PERMISSIONS.WRITE),
  validateParams(getDocumentByIdSchema),
  DocumentController.delete
);

export default router;
