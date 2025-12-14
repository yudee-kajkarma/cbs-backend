import { Router } from "express";
import { NetworkEquipmentController } from "../controllers/network-equipment.controller";
import { validateRequest, validateParams, validateQuery } from "../middlewares/validate.middleware";
import {
  createNetworkEquipmentSchema,
  updateNetworkEquipmentSchema,
  idParamSchema,
  listQuerySchema
} from "../validators/network-equipment.dto";

const router = Router();

router.post("/", validateRequest(createNetworkEquipmentSchema), NetworkEquipmentController.create);
router.get("/", validateQuery(listQuerySchema), NetworkEquipmentController.getAll);
router.get("/:id", validateParams(idParamSchema), NetworkEquipmentController.getById);
router.put("/:id", validateParams(idParamSchema), validateRequest(updateNetworkEquipmentSchema), NetworkEquipmentController.update);
router.delete("/:id", validateParams(idParamSchema), NetworkEquipmentController.delete);

export default router;
