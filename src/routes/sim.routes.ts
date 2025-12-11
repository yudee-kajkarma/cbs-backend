import { Router } from "express";
import { simController } from "../controllers/sim.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/sim.middleware";
import { createSimSchema, updateSimSchema, idParamSchema, getSimsQuerySchema } from "../dto/sim.dto";

const router = Router();

// Create
router.post("/", validateBody(createSimSchema), (req, res) => simController.create(req, res));

// List with pagination & filters
router.get("/", validateQuery(getSimsQuerySchema), (req, res) => simController.getAll(req, res));

// Get one
router.get("/:id", validateParams(idParamSchema), (req, res) => simController.getOne(req, res));

// Update
router.put("/:id", validateParams(idParamSchema), validateBody(updateSimSchema), (req, res) =>
  simController.update(req, res)
);

// Delete
router.delete("/:id", validateParams(idParamSchema), (req, res) => simController.delete(req, res));

export default router;
