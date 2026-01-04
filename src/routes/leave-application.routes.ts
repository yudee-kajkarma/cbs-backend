import { Router } from "express";
import { LeaveApplicationController } from "../controllers/leave-application.controller";
import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";
import { requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createLeaveApplicationSchema,
  updateLeaveApplicationSchema,
  updateStatusLeaveApplicationSchema,
  leaveApplicationIdSchema,
  employeeIdParamSchema,
  approveRejectParamSchema
} from "../validators/leave-application.validator";

const router = Router();

// CREATE - HR or Admin only
router.post(
  "/:employeeId",
  authenticate,
  // requireHROrAdmin,
  validateParams(employeeIdParamSchema),
  validateRequest(createLeaveApplicationSchema),
  LeaveApplicationController.create
);

// LIST - HR or Admin only
router.get("/", 
  authenticate, 
  // requireHROrAdmin,
  LeaveApplicationController.getAll);

// GET BY ID - HR or Admin only
router.get(
  "/:id",
  authenticate,
  // requireHROrAdmin,
  validateParams(leaveApplicationIdSchema),
  LeaveApplicationController.getById
);

// APPROVE/REJECT - HR or Admin only
router.patch(
  "/:id/:action/:approvedBy",
  authenticate,
  requireHROrAdmin,
  validateParams(approveRejectParamSchema),
  validateRequest(updateStatusLeaveApplicationSchema),
  LeaveApplicationController.updateStatus
);

// UPDATE - HR or Admin only
router.put(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(leaveApplicationIdSchema),
  validateRequest(updateLeaveApplicationSchema),
  LeaveApplicationController.update
);

// DELETE - HR or Admin only
router.delete(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(leaveApplicationIdSchema),
  LeaveApplicationController.delete
);

export default router;
