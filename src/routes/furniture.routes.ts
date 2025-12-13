import { Router } from "express";
import { FurnitureController } from "../controllers/furniture.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createFurnitureSchema,
  updateFurnitureSchema,
  getFurnitureListSchema,
  getFurnitureByIdSchema,
} from "../validators/furniture.validator";

const router = Router();

router.post("/", validateRequest(createFurnitureSchema), FurnitureController.create);
router.get("/", validateQuery(getFurnitureListSchema), FurnitureController.getAll);
router.get("/:id", validateParams(getFurnitureByIdSchema), FurnitureController.getById);
router.put("/:id", validateParams(getFurnitureByIdSchema), validateRequest(updateFurnitureSchema), FurnitureController.update);
router.delete("/:id", validateParams(getFurnitureByIdSchema), FurnitureController.delete);

export default router;
