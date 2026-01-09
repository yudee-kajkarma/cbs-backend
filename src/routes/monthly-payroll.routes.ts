import { Router } from "express";
import { MonthlyPayrollController } from "../controllers/monthly-payroll.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  updatePayrollSchema,
  payrollIdSchema,
  payrollQuerySchema,
  processAllPayrollSchema,
  statisticsQuerySchema,
  exportReportQuerySchema,
  recalculateAllPayrollsSchema,
} from "../validators/monthly-payroll.validator";

const router = Router();

/**
 * @route   POST /api/monthly-payroll/process-all
 * @desc    Process all pending payrolls for a given month/year
 * @access  Private (HR/Admin)
 */
router.post(
  "/process-all",
  authenticate,
  requireHROrAdmin,
  validateRequest(processAllPayrollSchema),
  MonthlyPayrollController.processAllPending
);

/**
 * @route   POST /api/monthly-payroll/recalculate-all
 * @desc    Recalculate/update payroll for all active employees
 * @access  Private (HR/Admin)
 */
router.post(
  "/recalculate-all",
  authenticate,
  requireHROrAdmin,
  validateRequest(recalculateAllPayrollsSchema),
  MonthlyPayrollController.recalculateAllPayrolls
);

/**
 * @route   GET /api/monthly-payroll/statistics
 * @desc    Get payroll statistics for a specific month and year
 * @access  Private (HR/Admin)
 */
router.get(
  "/statistics",
  authenticate,
  requireHROrAdmin,
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
  authenticate,
  requireHROrAdmin,
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
  authenticate,
  requireHROrAdmin,
  validateQuery(payrollQuerySchema),
  MonthlyPayrollController.getAll
);

/**
 * @route   GET /api/monthly-payroll/:id
 * @desc    Get payroll by ID
 * @access  Private (HR/Admin)
 */
router.get(
  "/:id",
  authenticate,
  requireHROrAdmin,
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
  authenticate,
  requireHROrAdmin,
  validateParams(updatePayrollSchema),
  MonthlyPayrollController.update
);

export default router;
