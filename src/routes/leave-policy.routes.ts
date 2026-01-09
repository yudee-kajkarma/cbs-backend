import { Router } from "express";
import { LeavePolicyController } from "../controllers/leave-policy.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { requireAdmin, requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { createLeavePolicySchema, updateLeavePolicySchema } from "../validators/leave-policy.validator";

const router = Router();

// CREATE - HR or Admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(createLeavePolicySchema),
  LeavePolicyController.create
);

// GET - HR or Admin only
router.get("/", authenticate, requireHROrAdmin, LeavePolicyController.get);

// UPDATE - HR or Admin only
router.put(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(updateLeavePolicySchema),
  LeavePolicyController.update
);

export default router;
