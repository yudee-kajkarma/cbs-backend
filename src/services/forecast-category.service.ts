import { ForecastCategory } from "../models";
import { DEFAULT_CATEGORIES } from "../models/forecastCategory.model";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";

export class ForecastCategoryService {
    /**
     * Get all categories, seeding defaults if the collection is empty
     */
    static async getAll(): Promise<any[]> {
        try {
            const existing = await ForecastCategory.find().sort({ isDefault: -1, name: 1 }).lean();

            if (existing.length === 0) {
                // ordered: false — if two requests race here, duplicate-key errors are
                // silently skipped rather than throwing, so both requests succeed.
                try {
                    await ForecastCategory.insertMany(
                        DEFAULT_CATEGORIES.map((name) => ({ name, isDefault: true })),
                        { ordered: false }
                    );
                } catch {
                    // Duplicate key errors are acceptable here (race condition); ignore them.
                }
                return await ForecastCategory.find().sort({ isDefault: -1, name: 1 }).lean();
            }

            return existing;
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: "ForecastCategoryService",
                method: "getAll",
            });
        }
    }

    /**
     * Create a new custom category
     */
    static async create(name: string): Promise<any> {
        try {
            const trimmed = name.trim();

            const duplicate = await ForecastCategory.findOne({
                name: { $regex: new RegExp(`^${trimmed}$`, "i") },
            }).lean();

            if (duplicate) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_CATEGORY_EXISTS);
            }

            const created = await ForecastCategory.create({ name: trimmed, isDefault: false });
            return created.toObject();
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: "ForecastCategoryService",
                method: "create",
                data: { name },
            });
        }
    }

    /**
     * Delete a custom category (default categories cannot be deleted)
     */
    static async remove(id: string): Promise<void> {
        try {
            const category = await ForecastCategory.findById(id).lean();

            if (!category) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_CATEGORY_NOT_FOUND);
            }

            if ((category as any).isDefault) {
                throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_CATEGORY_DEFAULT);
            }

            await ForecastCategory.findByIdAndDelete(id);
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: "ForecastCategoryService",
                method: "remove",
                id,
            });
        }
    }
}
