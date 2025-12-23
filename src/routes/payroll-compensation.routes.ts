import { Router } from "express";
import { PayrollCompensationController } from "../controllers/payroll-compensation.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { createPayrollCompensationSchema, updatePayrollCompensationSchema } from "../validators/payrollCompensation.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createPayrollCompensationSchema),
  PayrollCompensationController.create
);

// GET
router.get("/", PayrollCompensationController.get);

// UPDATE 
router.put(
  "/",
  validateRequest(updatePayrollCompensationSchema),
  PayrollCompensationController.update
);

export default router;
