import { Router } from "express";

import { UserController } from "../controllers/user.controller";

import {
  validateRequest,
  validateParams,
} from "../middlewares/validate.middleware";

import { requireAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  assignRolesSchema,
} from "../validators/user.validator";

const router = Router();

// CREATE - Admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(createUserSchema),
  UserController.create
);

// LIST - Admin only
router.get("/", authenticate, requireAdmin, UserController.getAll);

// GET BY ID - Admin only
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(userIdSchema),
  UserController.getById
);

// UPDATE - Admin only
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(userIdSchema),
  validateRequest(updateUserSchema),
  UserController.update
);

// ASSIGN ROLES - Admin only
router.put(
  "/:id/roles",
  authenticate,
  requireAdmin,
  validateParams(userIdSchema),
  validateRequest(assignRolesSchema),
  UserController.assignRoles
);

// DELETE - Admin only
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(userIdSchema),
  UserController.delete
);

export default router;
