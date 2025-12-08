import { Router } from "express";
import { newHardwareController } from "../controllers/newhardware.controller";
import {
  newHardwareValidateRequest,
  newHardwareValidateQuery,
  newHardwareValidateParams,
} from "../middlewares/newhardware.middleware";

import {
  createNewHardwareSchema,
  updateNewHardwareSchema,
  getNewHardwareListSchema,
  getNewHardwareByIdSchema,
} from "../dto/newhardware.dto";

const router = Router();

// CREATE
router.post("/", newHardwareValidateRequest(createNewHardwareSchema), newHardwareController.create);

// GET ALL (list with filters)
router.get("/", newHardwareValidateQuery(getNewHardwareListSchema), newHardwareController.getAll);

// GET BY ID
router.get("/:id", newHardwareValidateParams(getNewHardwareByIdSchema), newHardwareController.getById);

// UPDATE
router.put(
  "/:id",
  newHardwareValidateParams(getNewHardwareByIdSchema),
  newHardwareValidateRequest(updateNewHardwareSchema),
  newHardwareController.update
);

// DELETE
router.delete("/:id", newHardwareValidateParams(getNewHardwareByIdSchema), newHardwareController.delete);

export default router;
