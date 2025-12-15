import Joi from "joi";
import { ForecastType, ForecastStatus, ForecastCategory } from "../constants/forecast.constants";
import { Currency } from "../constants/common.constants";

export const forecastIdSchema = Joi.object({
    id: Joi.string().length(24).hex().required(),
});

export const createForecastSchema = Joi.object({
    date: Joi.date().required(),
    type: Joi.string().valid(...Object.values(ForecastType)).required(),
    category: Joi.string().valid(...Object.values(ForecastCategory)).required(),
    description: Joi.string().max(500).required(),
    amount: Joi.number().min(0.01).required(),
    currency: Joi.string().valid(...Object.values(Currency)).default(Currency.KWD),
    bankAccount: Joi.string().length(24).hex().required(),
    status: Joi.string().valid(...Object.values(ForecastStatus)).default(ForecastStatus.PLANNED),
});

export const updateForecastSchema = Joi.object({
    date: Joi.date().optional(),
    type: Joi.string().valid(...Object.values(ForecastType)).optional(),
    category: Joi.string().valid(...Object.values(ForecastCategory)).optional(),
    description: Joi.string().max(500).optional(),
    amount: Joi.number().min(0.01).optional(),
    currency: Joi.string().valid(...Object.values(Currency)).optional(),
    bankAccount: Joi.string().length(24).hex().optional(),
    status: Joi.string().valid(...Object.values(ForecastStatus)).optional(),
}).min(1);

export const getForecastListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(10),
    search: Joi.string().optional().allow(""),
    type: Joi.string().valid(...Object.values(ForecastType)).optional(),
    category: Joi.string().valid(...Object.values(ForecastCategory)).optional(),
    status: Joi.string().valid(...Object.values(ForecastStatus)).optional(),
    bankAccount: Joi.string().length(24).hex().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    orderBy: Joi.string()
        .valid(
            "date",
            "type",
            "category",
            "amount",
            "status",
            "createdAt",
            "updatedAt"
        )
        .default("date"),
    sortBy: Joi.string()
        .valid("asc", "desc")
        .default("desc"),
});

export const getForecastSummarySchema = Joi.object({
    bankAccount: Joi.string().length(24).hex().optional(),
    status: Joi.string().valid(...Object.values(ForecastStatus)).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
});
