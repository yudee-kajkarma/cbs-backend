import { Router } from "express";
import { LeaveBalanceController } from "../controllers/leave-balance.controller";
import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";
import { requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  initializeLeaveBalanceSchema,
  updateLeaveBalanceSchema,
  leaveBalanceIdSchema
} from "../validators/leave-balance.validator";

const router = Router();

// INITIALIZE (Create) - HR or Admin only
router.post(
  "/initialize",
  authenticate,
  requireHROrAdmin,
  validateRequest(initializeLeaveBalanceSchema),
  LeaveBalanceController.initialize
);

// LIST - HR or Admin only
router.get("/", authenticate, requireHROrAdmin, LeaveBalanceController.getAll);

// GET BY EMPLOYEE ID - HR or Admin only
router.get(
  "/employee/:employeeId",
  authenticate,
  requireHROrAdmin,
  validateParams(leaveBalanceIdSchema),
  LeaveBalanceController.getByEmployeeId
);

// UPDATE BY EMPLOYEE ID - HR or Admin only
router.put(
  "/employee/:employeeId",
  authenticate,
  requireHROrAdmin,
  validateParams(leaveBalanceIdSchema),
  validateRequest(updateLeaveBalanceSchema),
  LeaveBalanceController.updateByEmployeeId
);

// DELETE BY EMPLOYEE ID - HR or Admin only
router.delete(
  "/employee/:employeeId",
  authenticate,
  requireHROrAdmin,
  validateParams(leaveBalanceIdSchema),
  LeaveBalanceController.deleteByEmployeeId
);

export default router;
