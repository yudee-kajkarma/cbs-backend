import { Router } from "express";
import { ForecastController } from "../controllers/forecast.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import {
  createForecastSchema,
  updateForecastSchema,
  forecastIdSchema,
  getForecastListSchema,
  getForecastSummarySchema,
  importForecastCSVSchema,
} from "../validators/forecast.validator";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

// CREATE - Requires WRITE permission
router.post(
  "/",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.WRITE),
  validateRequest(createForecastSchema),
  ForecastController.create
);

// SUMMARY - Requires READ permission
router.get(
  "/summary",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.READ),
  validateQuery(getForecastSummarySchema),
  ForecastController.getSummary
);

// EXPORT CSV - Requires READ permission
router.get(
  "/export",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.READ),
  validateQuery(getForecastListSchema),
  ForecastController.exportCSV
);

// UPLOAD CSV - Requires WRITE permission
router.post(
  "/upload-csv",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.WRITE),
  upload.single('file'),
  ForecastController.uploadCsvFile
);

// LIST - Requires READ permission
router.get(
  "/",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.READ),
  validateQuery(getForecastListSchema),
  ForecastController.getAll
);

// GET BY ID - Requires READ permission
router.get(
  "/:id",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.READ),
  validateParams(forecastIdSchema),
  ForecastController.getById
);

// UPDATE - Requires WRITE permission
router.put(
  "/:id",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.WRITE),
  validateParams(forecastIdSchema),
  validateRequest(updateForecastSchema),
  ForecastController.update
);

// DELETE - Requires WRITE permission
router.delete(
  "/:id",
  authenticate,
  checkPermission("banking", "cash_flow_forecast", PERMISSIONS.WRITE),
  validateParams(forecastIdSchema),
  ForecastController.delete
);

export default router;
