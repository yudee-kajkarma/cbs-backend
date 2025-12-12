import { Router } from "express";
import { SimController } from "../controllers/sim.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import { createSimSchema, updateSimSchema, idParamSchema, getSimsQuerySchema } from "../validators/sim.dto";

const router = Router();

// Create
router.post("/", validateBody(createSimSchema), SimController.create);

// List with pagination & filters
router.get("/", validateQuery(getSimsQuerySchema), SimController.getAll);

// Get one
router.get("/:id", validateParams(idParamSchema), SimController.getById);

// Update
router.put("/:id", validateParams(idParamSchema), validateBody(updateSimSchema), SimController.update);

// Delete
router.delete("/:id", validateParams(idParamSchema), SimController.delete);

export default router;
