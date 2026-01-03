import { Router } from "express";

import { LicenseController } from "../controllers/license.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createLicenseSchema,
  updateLicenseSchema,
  licenseIdSchema,
  licenseQuerySchema,
} from "../validators/license.validator";

const router = Router();

// ---------- CREATE ---------- Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("company_documents", "license", PERMISSIONS.WRITE),
  validateRequest(createLicenseSchema),
  LicenseController.create
);


// ---------- GET ALL ---------- Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("company_documents", "license", PERMISSIONS.READ),
  validateQuery(licenseQuerySchema),
  LicenseController.getAll
);


// ---------- GET ONE ---------- Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("company_documents", "license", PERMISSIONS.READ),
  validateParams(licenseIdSchema),
  LicenseController.getById
);


// ---------- UPDATE ---------- Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("company_documents", "license", PERMISSIONS.WRITE),
  validateParams(licenseIdSchema),
  validateRequest(updateLicenseSchema),
  LicenseController.update
);


// ---------- DELETE ---------- Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("company_documents", "license", PERMISSIONS.WRITE),
  validateParams(licenseIdSchema),
  LicenseController.delete
);

export default router;
