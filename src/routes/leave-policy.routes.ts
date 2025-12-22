import { Router } from "express";
import { LeavePolicyController } from "../controllers/leave-policy.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { updateLeavePolicySchema } from "../validators/leave-policy.validator";

const router = Router();

// GET - 
router.get("/", LeavePolicyController.get);

// UPDATE 
router.put(
  "/",
  validateRequest(updateLeavePolicySchema),
  LeavePolicyController.update
);

export default router;
