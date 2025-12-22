import { Router } from "express";
import { LeaveBalanceController } from "../controllers/leave-balance.controller";
import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";
import {
  initializeLeaveBalanceSchema,
  updateLeaveBalanceSchema,
  leaveBalanceIdSchema
} from "../validators/leave-balance.validator";

const router = Router();

// INITIALIZE (Create)
router.post(
  "/initialize",
  validateRequest(initializeLeaveBalanceSchema),
  LeaveBalanceController.initialize
);

// LIST
router.get("/", LeaveBalanceController.getAll);

// GET BY EMPLOYEE ID 
router.get(
  "/employee/:employeeId",
  validateParams(leaveBalanceIdSchema),
  LeaveBalanceController.getByEmployeeId
);

// UPDATE BY EMPLOYEE ID 
router.put(
  "/employee/:employeeId",
  validateParams(leaveBalanceIdSchema),
  validateRequest(updateLeaveBalanceSchema),
  LeaveBalanceController.updateByEmployeeId
);

// DELETE BY EMPLOYEE ID 
router.delete(
  "/employee/:employeeId",
  validateParams(leaveBalanceIdSchema),
  LeaveBalanceController.deleteByEmployeeId
);

export default router;
