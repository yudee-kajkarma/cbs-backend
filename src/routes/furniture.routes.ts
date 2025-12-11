import { Router } from "express";
import { furnitureController } from "../controllers/furniture.controller";
import {
  furnitureValidateRequest,
  furnitureValidateQuery,
  furnitureValidateParams,
} from "../middlewares/furniture.middleware";
import {
  createFurnitureSchema,
  updateFurnitureSchema,
  getFurnitureListSchema,
  getFurnitureByIdSchema,
} from "../dto/furniture.dto";

const router = Router();

router.post("/", furnitureValidateRequest(createFurnitureSchema), furnitureController.create);
router.get("/", furnitureValidateQuery(getFurnitureListSchema), furnitureController.getAll);
router.get("/:id", furnitureValidateParams(getFurnitureByIdSchema), furnitureController.getById);
router.put("/:id", furnitureValidateParams(getFurnitureByIdSchema), furnitureValidateRequest(updateFurnitureSchema), furnitureController.update);
router.delete("/:id", furnitureValidateParams(getFurnitureByIdSchema), furnitureController.delete);

export default router;
