import { Schema } from "mongoose";
import { allowedForecastCategories } from "../constants/forecast.constants";

export const forecastCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            maxlength: [100, "Category name cannot exceed 100 characters"],
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Unique index on name per tenant collection
forecastCategorySchema.index({ name: 1 }, { unique: true });

export const DEFAULT_CATEGORIES = allowedForecastCategories;

// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
