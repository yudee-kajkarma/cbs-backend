import { Router } from "express";
import { ChequeController } from "../controllers/cheque.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createChequeSchema,
  updateChequeSchema,
  chequeIdSchema,
  getChequeListSchema,
} from "../validators/cheque.validator";

const router = Router();

router.post(
  "/",
  validateRequest(createChequeSchema),
  ChequeController.create
);

router.get(
  "/",
  validateQuery(getChequeListSchema),
  ChequeController.getAll
);

router.get(
  "/:id",
  validateParams(chequeIdSchema),
  ChequeController.getById
);

router.put(
  "/:id",
  validateParams(chequeIdSchema),
  validateRequest(updateChequeSchema),
  ChequeController.update
);

router.delete(
  "/:id",
  validateParams(chequeIdSchema),
  ChequeController.delete
);

export default router;
