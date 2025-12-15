import { Router } from "express";

import { ISOController } from "../controllers/iso.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { createISOSchema, updateISOSchema, isoIdSchema, isoQuerySchema } from "../validators/iso.validator";

const router = Router();

router.post(
  "/",
  validateRequest(createISOSchema),
  ISOController.create
);

router.get(
  "/",
  validateQuery(isoQuerySchema),
  ISOController.getAll
);

router.get(
  "/:id",
  validateParams(isoIdSchema),
  ISOController.getById
);

router.put(
  "/:id",
  validateParams(isoIdSchema),
  validateRequest(updateISOSchema),
  ISOController.update
);

router.delete(
  "/:id",
  validateParams(isoIdSchema),
  ISOController.delete
);

export default router;
