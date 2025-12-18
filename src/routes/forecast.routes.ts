import { Router } from "express";
import { ForecastController } from "../controllers/forecast.controller";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
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

router.post(
  "/",
  validateRequest(createForecastSchema),
  ForecastController.create
);

router.get(
  "/summary",
  validateQuery(getForecastSummarySchema),
  ForecastController.getSummary
);

router.get(
  "/export",
  validateQuery(getForecastListSchema),
  ForecastController.exportCSV
);

router.post(
  "/upload-csv",
  upload.single('file'),
  ForecastController.uploadCsvFile
);

router.get(
  "/",
  validateQuery(getForecastListSchema),
  ForecastController.getAll
);


router.get(
  "/:id",
  validateParams(forecastIdSchema),
  ForecastController.getById
);

router.put(
  "/:id",
  validateParams(forecastIdSchema),
  validateRequest(updateForecastSchema),
  ForecastController.update
);

router.delete(
  "/:id",
  validateParams(forecastIdSchema),
  ForecastController.delete
);

export default router;
