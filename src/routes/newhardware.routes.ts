import { Router } from "express";
import { NewHardwareController } from "../controllers/newhardware.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";

import {
  createNewHardwareSchema,
  updateNewHardwareSchema,
  getNewHardwareListSchema,
  getNewHardwareByIdSchema,
} from "../validators/newhardware.validator";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("it_management", "hardware", PERMISSIONS.WRITE),
  validateRequest(createNewHardwareSchema),
  NewHardwareController.create
);

// GET ALL (list with filters) - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("it_management", "hardware", PERMISSIONS.READ),
  validateQuery(getNewHardwareListSchema),
  NewHardwareController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("it_management", "hardware", PERMISSIONS.READ),
  validateParams(getNewHardwareByIdSchema),
  NewHardwareController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("it_management", "hardware", PERMISSIONS.WRITE),
  validateParams(getNewHardwareByIdSchema),
  validateRequest(updateNewHardwareSchema),
  NewHardwareController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("it_management", "hardware", PERMISSIONS.WRITE),
  validateParams(getNewHardwareByIdSchema),
  NewHardwareController.delete
);

export default router;
