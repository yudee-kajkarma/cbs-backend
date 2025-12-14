import { Router } from "express";
import { SoftwareController } from "../controllers/software.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { createSoftwareSchema, updateSoftwareSchema, idParamSchema, listQuerySchema } from "../validators/software.dto";

const router = Router();

router.post("/", validateBody(createSoftwareSchema), SoftwareController.create);
router.get("/", validateQuery(listQuerySchema), SoftwareController.getAll);
router.get("/:id", validateParams(idParamSchema), SoftwareController.getById);
router.put("/:id", validateParams(idParamSchema), validateBody(updateSoftwareSchema), SoftwareController.update);
router.delete("/:id", validateParams(idParamSchema), SoftwareController.delete);

export default router;
