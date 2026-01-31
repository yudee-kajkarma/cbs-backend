import { Router } from "express";
import { AttendancePolicyController } from "../controllers/attendance-policy.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { requireAdmin, requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { createAttendancePolicySchema, updateAttendancePolicySchema } from "../validators/attendancePolicy.validator";

const router = Router();

// GET - HR or Admin only
router.get("/", authenticate, requireHROrAdmin, AttendancePolicyController.get);

// UPDATE (or CREATE if not exists) - Admin only
router.put(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(updateAttendancePolicySchema),
  AttendancePolicyController.update
);

export default router;
