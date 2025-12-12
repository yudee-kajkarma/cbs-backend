import { Router } from "express";

import { ISOController } from "../controllers/iso.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { createISODto, updateISODto, isoIdDto, isoQueryDto } from "../validators/iso.dto";

const router = Router();

router.post(
  "/",
  validateRequest(createISODto),
  ISOController.create
);

router.get(
  "/",
  validateQuery(isoQueryDto),
  ISOController.getAll
);

router.get(
  "/:id",
  validateParams(isoIdDto),
  ISOController.getById
);

router.put(
  "/:id",
  validateParams(isoIdDto),
  validateRequest(updateISODto),
  ISOController.update
);

router.delete(
  "/:id",
  validateParams(isoIdDto),
  ISOController.delete
);

export default router;
