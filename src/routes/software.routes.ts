import { Router } from "express";
import { softwareController } from "../controllers/software.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/software.middleware";
import { createSoftwareSchema, updateSoftwareSchema, idParamSchema, listQuerySchema } from "../dto/software.dto";

const router = Router();

router.post("/", validateBody(createSoftwareSchema), (req, res) => softwareController.create(req, res));
router.get("/", validateQuery(listQuerySchema), (req, res) => softwareController.getAll(req, res));
router.get("/:id", validateParams(idParamSchema), (req, res) => softwareController.getOne(req, res));
router.put("/:id", validateParams(idParamSchema), validateBody(updateSoftwareSchema), (req, res) => softwareController.update(req, res));
router.delete("/:id", validateParams(idParamSchema), (req, res) => softwareController.delete(req, res));

export default router;
