import { Router } from "express";
import { ForecastCategoryController } from "../controllers/forecast-category.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permission.constants";
import { validateRequest, validateParams } from "../middlewares/validate.middleware";
import Joi from "joi";

const router = Router();

const createCategorySchema = Joi.object({
    name: Joi.string().trim().max(100).required(),
});

const categoryIdSchema = Joi.object({
    id: Joi.string().length(24).hex().required(),
});

// GET all categories
router.get(
    "/",
    authenticate,
    checkPermission("banking", "cash_flow_forecast", PERMISSIONS.READ),
    ForecastCategoryController.getAll
);

// POST create a new category
router.post(
    "/",
    authenticate,
    checkPermission("banking", "cash_flow_forecast", PERMISSIONS.WRITE),
    validateRequest(createCategorySchema),
    ForecastCategoryController.create
);

// DELETE a custom category
router.delete(
    "/:id",
    authenticate,
    checkPermission("banking", "cash_flow_forecast", PERMISSIONS.WRITE),
    validateParams(categoryIdSchema),
    ForecastCategoryController.remove
);

export default router;
