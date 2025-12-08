import { Router } from "express";
import { supportController } from "../controllers/support.controller";

import {
  supportValidateRequest,
  supportValidateQuery,
  supportValidateParams,
} from "../middlewares/support.middleware";

import {
  createSupportSchema,
  updateSupportSchema,
  getSupportListSchema,
  getSupportByIdSchema,
} from "../dto/support.dto";

const router = Router();

// CREATE
router.post("/", supportValidateRequest(createSupportSchema), supportController.create);

// GET ALL
router.get("/", supportValidateQuery(getSupportListSchema), supportController.getAll);

// GET BY ID
router.get("/:id", supportValidateParams(getSupportByIdSchema), supportController.getById);

// UPDATE
router.put(
  "/:id",
  supportValidateParams(getSupportByIdSchema),
  supportValidateRequest(updateSupportSchema),
  supportController.update
);

// DELETE
router.delete("/:id", supportValidateParams(getSupportByIdSchema), supportController.delete);

export default router;
