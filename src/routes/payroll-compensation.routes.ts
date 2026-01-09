import { Router } from "express";
import { PayrollCompensationController } from "../controllers/payroll-compensation.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { requireAdmin, requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { createPayrollCompensationSchema, updatePayrollCompensationSchema } from "../validators/payrollCompensation.validator";

const router = Router();

// CREATE - HR or Admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(createPayrollCompensationSchema),
  PayrollCompensationController.create
);

// GET - HR or Admin only
router.get("/", authenticate, requireHROrAdmin, PayrollCompensationController.get);

// UPDATE - HR or Admin only
router.put(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(updatePayrollCompensationSchema),
  PayrollCompensationController.update
);

export default router;
