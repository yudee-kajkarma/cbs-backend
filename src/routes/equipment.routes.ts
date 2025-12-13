import { Router } from "express";
import { EquipmentController } from "../controllers/equipment.controller";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  getEquipmentListSchema,
  getEquipmentByIdSchema,
} from "../validators/equipment.dto";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";

const router = Router();

router.post("/", validateRequest(createEquipmentSchema), EquipmentController.create);
router.get("/", validateQuery(getEquipmentListSchema), EquipmentController.getAll);
router.get("/:id", validateParams(getEquipmentByIdSchema), EquipmentController.getById);
router.put("/:id", validateParams(getEquipmentByIdSchema), validateRequest(updateEquipmentSchema), EquipmentController.update);
router.delete("/:id", validateParams(getEquipmentByIdSchema), EquipmentController.delete);

export default router;
