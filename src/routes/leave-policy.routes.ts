import { Router } from "express";
import { LeavePolicyController } from "../controllers/leave-policy.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { createLeavePolicySchema, updateLeavePolicySchema } from "../validators/leave-policy.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createLeavePolicySchema),
  LeavePolicyController.create
);

// GET
router.get("/", LeavePolicyController.get);

// UPDATE 
router.put(
  "/",
  validateRequest(updateLeavePolicySchema),
  LeavePolicyController.update
);

export default router;
