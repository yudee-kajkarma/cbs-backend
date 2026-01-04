import { Router } from "express";
import { LeaveApplicationController } from "../controllers/leave-application.controller";
import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";
import { requireAnyRole, requireHROrAdmin } from "../middlewares/role.middleware";
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

// CREATE - Any Role
router.post(
  "/:employeeId",
  authenticate,
  requireAnyRole,
  validateParams(employeeIdParamSchema),
  validateRequest(createLeaveApplicationSchema),
  LeaveApplicationController.create
);

// LIST - Any Role
router.get("/", authenticate, requireAnyRole, LeaveApplicationController.getAll);

// GET BY ID - Any Role
router.get(
  "/:id",
  authenticate,
  requireHROrAdmin,
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

// UPDATE - Any Role
router.put(
  "/:id",
  authenticate,
  requireAnyRole,
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
