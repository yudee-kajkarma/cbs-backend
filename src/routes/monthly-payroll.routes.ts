import { Router } from "express";
import { MonthlyPayrollController } from "../controllers/monthly-payroll.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import {
  generatePayrollSchema,
  updatePayrollSchema,
  payrollIdSchema,
  payrollQuerySchema,
  processAllPayrollSchema,
  statisticsQuerySchema,
  exportReportQuerySchema,
} from "../validators/monthly-payroll.validator";

const router = Router();

/**
 * @route   POST /api/monthly-payroll/generate
 * @desc    Generate monthly payroll for an employee
 * @access  Private (HR/Admin)
 */
router.post(
  "/",
  validateRequest(generatePayrollSchema),
  MonthlyPayrollController.generatePayroll
);

/**
 * @route   POST /api/monthly-payroll/process-all
 * @desc    Process all pending payrolls for a given month/year
 * @access  Private (HR/Admin)
 */
router.post(
  "/process-all",
  validateRequest(processAllPayrollSchema),
  MonthlyPayrollController.processAllPending
);

/**
 * @route   GET /api/monthly-payroll/statistics
 * @desc    Get payroll statistics for a specific month and year
 * @access  Private (HR/Admin)
 */
router.get(
  "/statistics",
  validateQuery(statisticsQuerySchema),
  MonthlyPayrollController.getStatistics
);

/**
 * @route   GET /api/monthly-payroll/export
 * @desc    Export payroll report for a specific month and year
 * @access  Private (HR/Admin)
 */
router.get(
  "/export",
  validateQuery(exportReportQuerySchema),
  MonthlyPayrollController.exportReport
);

/**
 * @route   GET /api/monthly-payroll
 * @desc    Get all payrolls with pagination and filtering
 * @access  Private (HR/Admin)
 */
router.get(
  "/",
  validateQuery(payrollQuerySchema),
  MonthlyPayrollController.getAll
);

/**
 * @route   GET /api/monthly-payroll/:id
 * @desc    Get payroll by ID
 * @access  Private
 */
router.get(
  "/:id",
  validateParams(payrollIdSchema),
  MonthlyPayrollController.getById
);

/**
 * @route   PUT /api/monthly-payroll/:id/:status
 * @desc    Update payroll status (Pending → Processed → Paid)
 * @access  Private (HR/Admin)
 */
router.put(
  "/:id/:status",
  validateParams(updatePayrollSchema),
  MonthlyPayrollController.update
);

export default router;
