import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import {
  validateRequest,
  validateParams,
} from "../middlewares/validate.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema,
  createDefaultRolesSchema,
} from "../validators/role.validator";

const router = Router();

// CREATE DEFAULT ROLES - Admin only
router.post(
  "/default",
  authenticate,
  requireAdmin,
  validateRequest(createDefaultRolesSchema),
  RoleController.createDefaultRoles
);

// CREATE - Admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(createRoleSchema),
  RoleController.create
);

// LIST - Admin only
router.get("/", authenticate, requireAdmin, RoleController.getAll);

// GET BY ID - Admin only
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(roleIdSchema),
  RoleController.getById
);

// UPDATE - Admin only
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(roleIdSchema),
  validateRequest(updateRoleSchema),
  RoleController.update
);

// DELETE - Admin only
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateParams(roleIdSchema),
  RoleController.delete
);

export default router;
