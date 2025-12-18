import { Router } from "express";

import { PayeeController } from "../controllers/payee.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  createPayeeSchema,
  updatePayeeSchema,
  payeeIdSchema
} from "../validators/payee.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createPayeeSchema),
  PayeeController.create
);

// LIST
router.get("/", PayeeController.getAll);

// GET BY ID
router.get(
  "/:id",
  validateParams(payeeIdSchema),
  PayeeController.getById
);

// UPDATE
router.put(
  "/:id",
  validateParams(payeeIdSchema),
  validateRequest(updatePayeeSchema),
  PayeeController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(payeeIdSchema),
  PayeeController.delete
);

export default router;
