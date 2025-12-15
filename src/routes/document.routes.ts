import { Router } from "express";

import { DocumentController } from "../controllers/document.controller";

import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";

import {
  createDocumentSchema,
  updateDocumentSchema,
  getDocumentByIdSchema,
  listDocumentQuerySchema,
} from "../validators/document.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createDocumentSchema),
  DocumentController.create
);

// LIST
router.get("/", validateQuery(listDocumentQuerySchema), DocumentController.getAll);

router.get("/:id/download-url", validateParams(getDocumentByIdSchema), DocumentController.getDownloadUrl);

// GET ONE
router.get("/:id", validateParams(getDocumentByIdSchema), DocumentController.getById);

// UPDATE
router.put(
  "/:id",
  validateParams(getDocumentByIdSchema),
  validateRequest(updateDocumentSchema),
  DocumentController.update
);

// DELETE
router.delete("/:id", validateParams(getDocumentByIdSchema), DocumentController.delete);

export default router;
