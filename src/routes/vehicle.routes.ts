import { Router } from "express";
import { VehicleController } from "../controllers/vehicle.controller";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../middlewares/validate.middleware";
import {
  createVehicleSchema,
  updateVehicleSchema,
  getVehicleListSchema,
  getVehicleByIdSchema,
} from "../validators/vehicle.dto";

const router = Router();

router.post("/", validateRequest(createVehicleSchema), VehicleController.create);
router.get("/", validateQuery(getVehicleListSchema), VehicleController.getAll);
router.get("/:id", validateParams(getVehicleByIdSchema), VehicleController.getById);
router.put("/:id", validateParams(getVehicleByIdSchema), validateRequest(updateVehicleSchema), VehicleController.update);
router.delete("/:id", validateParams(getVehicleByIdSchema), VehicleController.delete);

export default router;
