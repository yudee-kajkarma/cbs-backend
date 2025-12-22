import { Router } from "express";

import { UserController } from "../controllers/user.controller";

import {
  validateRequest,
  validateParams
} from "../middlewares/validate.middleware";

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema
} from "../validators/user.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createUserSchema),
  UserController.create
);

// LIST
router.get("/", UserController.getAll);

// GET BY ID
router.get(
  "/:id",
  validateParams(userIdSchema),
  UserController.getById
);

// UPDATE
router.put(
  "/:id",
  validateParams(userIdSchema),
  validateRequest(updateUserSchema),
  UserController.update
);

// DELETE
router.delete(
  "/:id",
  validateParams(userIdSchema),
  UserController.delete
);

export default router;
