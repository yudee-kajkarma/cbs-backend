import { Router } from "express";
import { SupportController } from "../controllers/support.controller";

import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

import {
  createSupportSchema,
  updateSupportSchema,
  getSupportListSchema,
  getSupportByIdSchema,
} from "../validators/support.validator";

const router = Router();

// CREATE
router.post("/", validateRequest(createSupportSchema), SupportController.create);

// GET ALL
router.get("/", validateQuery(getSupportListSchema), SupportController.getAll);

// GET BY ID
router.get("/:id", validateParams(getSupportByIdSchema), SupportController.getById);

// UPDATE
router.put(
  "/:id",
  validateParams(getSupportByIdSchema),
  validateRequest(updateSupportSchema),
  SupportController.update
);

// DELETE
router.delete("/:id", validateParams(getSupportByIdSchema), SupportController.delete);

export default router;
