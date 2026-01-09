import { Router } from "express";
import { MetadataController } from "../controllers/metadata.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { requireAdmin, requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { createMetadataSchema, updateMetadataSchema } from "../validators/metadata.validator";

const router = Router();

// CREATE OR UPDATE - Admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(createMetadataSchema),
  MetadataController.createOrUpdate
);

// GET - HR or Admin only
router.get("/", authenticate, requireHROrAdmin, MetadataController.get);

export default router;
