
/**
 * Forecast Entry Type
 */
export enum ForecastType {
    INFLOW = "Inflow",
    OUTFLOW = "Outflow",
}

/**
 * Forecast Entry Status
 */
export enum ForecastStatus {
    PLANNED = "Planned",
    CONFIRMED = "Confirmed",
    COMPLETED = "Completed",
}

/**
 * Forecast Entry Category
 */
export enum ForecastCategory {
    CLIENT_PAYMENT = "Client Payment",
    SALARY = "Salary",
    RENT = "Rent",
    PURCHASE = "Purchase",
    UTILITIES = "Utilities",
    EQUIPMENT = "Equipment",
    OTHER = "Other",
}

export const allowedForecastTypes = Object.values(ForecastType);
export const allowedForecastStatuses = Object.values(ForecastStatus);
export const allowedForecastCategories = Object.values(ForecastCategory);
