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


// GET Employee Leave Summary/applications - Any Role
router.get(
  "/employee/:employeeId",
  authenticate,
  requireAnyRole,
  validateParams(employeeIdParamSchema),
  LeaveApplicationController.getEmployeeLeaveSummary
);

// CREATE 
router.post(
  "/:employeeId",
  authenticate,
  requireAnyRole,
  validateParams(employeeIdParamSchema),
  validateRequest(createLeaveApplicationSchema),
  LeaveApplicationController.create
);

// LIST - Any Role
router.get("/", authenticate, requireHROrAdmin, LeaveApplicationController.getAll);

// GET BY ID - Any Role
router.get(
  "/:id",
  authenticate,
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
