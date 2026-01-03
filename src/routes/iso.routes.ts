import { Router } from "express";

import { ISOController } from "../controllers/iso.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import { createISOSchema, updateISOSchema, isoIdSchema, isoQuerySchema } from "../validators/iso.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("company_documents", "iso", PERMISSIONS.WRITE),
  validateRequest(createISOSchema),
  ISOController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("company_documents", "iso", PERMISSIONS.READ),
  validateQuery(isoQuerySchema),
  ISOController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("company_documents", "iso", PERMISSIONS.READ),
  validateParams(isoIdSchema),
  ISOController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("company_documents", "iso", PERMISSIONS.WRITE),
  validateParams(isoIdSchema),
  validateRequest(updateISOSchema),
  ISOController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("company_documents", "iso", PERMISSIONS.WRITE),
  validateParams(isoIdSchema),
  ISOController.delete
);

export default router;
