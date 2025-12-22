import { Router } from "express";
import { LeaveApplicationController } from "../controllers/leave-application.controller";
import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";
import {
  createLeaveApplicationSchema,
  updateLeaveApplicationSchema,
  updateStatusLeaveApplicationSchema,
  leaveApplicationIdSchema,
  employeeIdParamSchema,
  approveRejectParamSchema
} from "../validators/leave-application.validator";

const router = Router();

// CREATE
router.post(
  "/:employeeId",
  validateParams(employeeIdParamSchema),
  validateRequest(createLeaveApplicationSchema),
  LeaveApplicationController.create
);

// LIST
router.get("/", LeaveApplicationController.getAll);

// GET BY ID
router.get(
  "/:id",
  validateParams(leaveApplicationIdSchema),
  LeaveApplicationController.getById
);

// APPROVE/REJECT - action and approvedBy in params
router.patch(
  "/:id/:action/:approvedBy",
  validateParams(approveRejectParamSchema),
  validateRequest(updateStatusLeaveApplicationSchema),
  LeaveApplicationController.updateStatus
);

// UPDATE
router.put(
  "/:id",
  validateParams(leaveApplicationIdSchema),
  validateRequest(updateLeaveApplicationSchema),
  LeaveApplicationController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(leaveApplicationIdSchema),
  LeaveApplicationController.delete
);

export default router;
