import { Router } from "express";
import { NewHardwareController } from "../controllers/newhardware.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

import {
  createNewHardwareSchema,
  updateNewHardwareSchema,
  getNewHardwareListSchema,
  getNewHardwareByIdSchema,
} from "../validators/newhardware.dto";

const router = Router();

// CREATE
router.post("/", validateRequest(createNewHardwareSchema), NewHardwareController.create);

// GET ALL (list with filters)
router.get("/", validateQuery(getNewHardwareListSchema), NewHardwareController.getAll);

// GET BY ID
router.get("/:id", validateParams(getNewHardwareByIdSchema), NewHardwareController.getById);

// UPDATE
router.put(
  "/:id",
  validateParams(getNewHardwareByIdSchema),
  validateRequest(updateNewHardwareSchema),
  NewHardwareController.update
);

// DELETE
router.delete("/:id", validateParams(getNewHardwareByIdSchema), NewHardwareController.delete);

export default router;
