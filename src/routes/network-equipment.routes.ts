import { Router } from "express";
import { networkEquipmentController } from "../controllers/network-equipment.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/network-equipment.middleware";
import {
  createNetworkEquipmentSchema,
  updateNetworkEquipmentSchema,
  idParamSchema,
  listQuerySchema
} from "../dto/network-equipment.dto";

const router = Router();

router.post("/", validateBody(createNetworkEquipmentSchema), (req, res) => networkEquipmentController.create(req, res));
router.get("/", validateQuery(listQuerySchema), (req, res) => networkEquipmentController.getAll(req, res));
router.get("/:id", validateParams(idParamSchema), (req, res) => networkEquipmentController.getOne(req, res));
router.put("/:id", validateParams(idParamSchema), validateBody(updateNetworkEquipmentSchema), (req, res) => networkEquipmentController.update(req, res));
router.delete("/:id", validateParams(idParamSchema), (req, res) => networkEquipmentController.delete(req, res));

export default router;
