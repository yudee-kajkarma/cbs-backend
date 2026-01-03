import { Router } from "express";

import { EmployeeController } from "../controllers/employee.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import { requireHROrAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";

import {
  updateEmployeeSchema,
  employeeIdSchema
} from "../validators/employee.validator";

const router = Router();

// LIST - HR or Admin only
router.get("/", authenticate, requireHROrAdmin, EmployeeController.getAll);

// GET BY ID - HR or Admin only
router.get(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(employeeIdSchema),
  EmployeeController.getById
);

// UPDATE - HR or Admin only
router.put(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(employeeIdSchema),
  validateRequest(updateEmployeeSchema),
  EmployeeController.update
);

// DELETE - HR or Admin only
router.delete(
  "/:id",
  authenticate,
  requireHROrAdmin,
  validateParams(employeeIdSchema),
  EmployeeController.delete
);

export default router;
