import { Router } from "express";
import multer from "multer";

import * as DocumentController from "../controllers/document.controller";

import {
  validateDocumentBody,
  validateDocumentParams,
  validateDocumentQuery,
} from "../middlewares/document.middleware";

import {
  createDocumentSchema,
  updateDocumentSchema,
  getDocumentByIdSchema,
  listDocumentQuerySchema,
} from "../dto/document.dto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post(
  "/",
  upload.single("file"),
  validateDocumentBody(createDocumentSchema),
  DocumentController.create
);

// LIST
router.get("/", validateDocumentQuery(listDocumentQuerySchema), DocumentController.list);

// GET ONE
router.get("/:id", validateDocumentParams(getDocumentByIdSchema), DocumentController.getOne);

// UPDATE
router.put(
  "/:id",
  upload.single("file"),
  validateDocumentParams(getDocumentByIdSchema),
  validateDocumentBody(updateDocumentSchema),
  DocumentController.update
);

// DELETE
router.delete("/:id", validateDocumentParams(getDocumentByIdSchema), DocumentController.remove);

export default router;
