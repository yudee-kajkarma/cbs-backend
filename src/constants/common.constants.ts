/**
 * Common Currency Enum
 */
export enum Currency {
  KWD = "KWD",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AED = "AED",
  SAR = "SAR",
}

/**
 * Common Department Enum
 */
export enum Department {
  ALL = "All",
  IT = "IT",
  FINANCE = "Finance",
  HR = "HR",
  OPERATIONS = "Operations",
  SALES = "Sales",
  MARKETING = "Marketing",
  ENGINEERING = "Engineering",
  LEGAL = "Legal",
  DESIGN = "Design",
}

/**
 * Common Condition Enum (for physical assets)
 */
export enum Condition {
  EXCELLENT = "Excellent",
  GOOD = "Good",
  FAIR = "Fair",
  POOR = "Poor",
  NON_FUNCTIONAL = "Non-Functional",
}

/**
 * Common Status Values
 */
export enum CommonStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

/**
 * Common Priority Enum
 */
export enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

export const allowedCurrencies = Object.values(Currency);
export const allowedDepartments = Object.values(Department);
export const allowedConditions = Object.values(Condition);
export const allowedCommonStatuses = Object.values(CommonStatus);
export const allowedPriorities = Object.values(Priority);
