import { Router } from "express";
import multer from "multer";

import * as ISOController from "../controllers/iso.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/iso.middleware";
import { createISODto, updateISODto, isoIdDto, isoQueryDto } from "../dto/iso.dto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  upload.single("file"),
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
  ISOController.getOne
);

router.put(
  "/:id",
  upload.single("file"),
  validateParams(isoIdDto),
  validateRequest(updateISODto),
  ISOController.update
);

router.delete(
  "/:id",
  validateParams(isoIdDto),
  ISOController.remove
);

export default router;
