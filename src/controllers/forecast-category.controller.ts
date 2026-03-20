import { Request, Response } from "express";
import { ForecastCategoryService } from "../services/forecast-category.service";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";

export class ForecastCategoryController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const categories = await ForecastCategoryService.getAll();
            res.status(200).json(ResponseUtil.success("Categories retrieved successfully", categories));
        } catch (error) {
            ErrorHandler.handleControllerError(error, res, { method: "getAll" });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            const category = await ForecastCategoryService.create(name);
            res.status(201).json(ResponseUtil.success("Category created successfully", category));
        } catch (error) {
            ErrorHandler.handleControllerError(error, res, { method: "create", data: req.body });
        }
    }

    static async remove(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await ForecastCategoryService.remove(id);
            res.status(200).json(ResponseUtil.success("Category deleted successfully", null));
        } catch (error) {
            ErrorHandler.handleControllerError(error, res, { method: "remove", id: req.params.id });
        }
    }
}
