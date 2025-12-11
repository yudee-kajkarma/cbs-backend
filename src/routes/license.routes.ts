import { Router } from "express";
import multer from "multer";

import * as LicenseController from "../controllers/license.controller";
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
} from "../dto/license.dto";

const router = Router();

// MEMORY STORAGE for S3
const upload = multer({ storage: multer.memoryStorage() });


// ---------- CREATE ----------
router.post(
  "/",
  upload.single("document"),
  validateRequest(createLicenseDto),
  LicenseController.create
);


// ---------- GET ALL ----------
router.get(
  "/",
  validateQuery(licenseQueryDto),     //  ✅ added pagination/search validation
  LicenseController.getAll
);


// ---------- GET ONE ----------
router.get(
  "/:id",
  validateParams(licenseIdDto),
  LicenseController.getOne
);


// ---------- UPDATE ----------
router.put(
  "/:id",
  upload.single("document"),
  validateParams(licenseIdDto),
  validateRequest(updateLicenseDto),
  LicenseController.update
);


// ---------- DELETE ----------
router.delete(
  "/:id",
  validateParams(licenseIdDto),
  LicenseController.remove
);


export default router;
