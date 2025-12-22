import { Router } from "express";

import { EmployeeController } from "../controllers/employee.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  updateEmployeeSchema,
  employeeIdSchema
} from "../validators/employee.validator";

const router = Router();

// LIST
router.get("/", EmployeeController.getAll);

router.get(
  "/:id",
  validateParams(employeeIdSchema),
  EmployeeController.getById
);

// UPDATE
router.put(
  "/:id",
  validateParams(employeeIdSchema),
  validateRequest(updateEmployeeSchema),
  EmployeeController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(employeeIdSchema),
  EmployeeController.delete
);

export default router;
