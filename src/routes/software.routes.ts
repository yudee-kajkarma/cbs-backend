import { Router } from "express";
import { SoftwareController } from "../controllers/software.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import { createSoftwareSchema, updateSoftwareSchema, idParamSchema, listQuerySchema } from "../validators/software.validator";

const router = Router();

/** * IT Management module - Software Licenses Resource Routes
 */

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("it_management", "software_licenses", PERMISSIONS.WRITE),
  validateBody(createSoftwareSchema),
  SoftwareController.create
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("it_management", "software_licenses", PERMISSIONS.READ),
  validateQuery(listQuerySchema),
  SoftwareController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("it_management", "software_licenses", PERMISSIONS.READ),
  validateParams(idParamSchema),
  SoftwareController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("it_management", "software_licenses", PERMISSIONS.WRITE),
  validateParams(idParamSchema),
  validateBody(updateSoftwareSchema),
  SoftwareController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("it_management", "software_licenses", PERMISSIONS.WRITE),
  validateParams(idParamSchema),
  SoftwareController.delete
);

export default router;
