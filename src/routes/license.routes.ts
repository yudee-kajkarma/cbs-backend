import { Router } from "express";

import { LicenseController } from "../controllers/license.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";

import {
  createLicenseDto,
  updateLicenseDto,
  licenseIdDto,
  licenseQueryDto,
} from "../validators/license.dto";

const router = Router();

// ---------- CREATE ----------
router.post(
  "/",
  validateRequest(createLicenseDto),
  LicenseController.create
);


// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(licenseQueryDto),
  LicenseController.getAll
);


// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(licenseIdDto),
  LicenseController.getById
);


// ---------- UPDATE ----------
router.put(
  "/:id",
  validateParams(licenseIdDto),
  validateRequest(updateLicenseDto),
  LicenseController.update
);


// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(licenseIdDto),
  LicenseController.delete
);

export default router;
