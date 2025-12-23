import { Router } from "express";
import { AttendancePolicyController } from "../controllers/attendance-policy.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { createAttendancePolicySchema, updateAttendancePolicySchema } from "../validators/attendancePolicy.validator";

const router = Router();

// CREATE
router.post(
  "/",
  validateRequest(createAttendancePolicySchema),
  AttendancePolicyController.create
);

// GET
router.get("/", AttendancePolicyController.get);

// UPDATE 
router.put(
  "/",
  validateRequest(updateAttendancePolicySchema),
  AttendancePolicyController.update
);

export default router;
