import { Router } from "express";

import { LicenseController } from "../controllers/license.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";

import {
  createLicenseSchema,
  updateLicenseSchema,
  licenseIdSchema,
  licenseQuerySchema,
} from "../validators/license.validator";

const router = Router();

// ---------- CREATE ----------
router.post(
  "/",
  validateRequest(createLicenseSchema),
  LicenseController.create
);


// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(licenseQuerySchema),
  LicenseController.getAll
);


// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(licenseIdSchema),
  LicenseController.getById
);


// ---------- UPDATE ----------
router.put(
  "/:id",
  validateParams(licenseIdSchema),
  validateRequest(updateLicenseSchema),
  LicenseController.update
);


// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(licenseIdSchema),
  LicenseController.delete
);

export default router;
