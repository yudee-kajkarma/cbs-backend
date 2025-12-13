import { Router } from "express";
import { PropertyController } from "../controllers/property.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertyListSchema,
  getPropertyByIdSchema,
} from "../validators/property.dto";

const router = Router();

router.post("/", validateRequest(createPropertySchema), PropertyController.create);
router.get("/", validateQuery(getPropertyListSchema), PropertyController.getAll);
router.get("/:id", validateParams(getPropertyByIdSchema), PropertyController.getById);
router.put("/:id", validateParams(getPropertyByIdSchema), validateRequest(updatePropertySchema), PropertyController.update);
router.delete("/:id", validateParams(getPropertyByIdSchema), PropertyController.delete);

export default router;
