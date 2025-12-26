/**
 * Monthly Payroll Status Enum
 */
export enum MonthlyPayrollStatus {
  PENDING = "Pending",
  PROCESSED = "Processed",
  PAID = "Paid",
}

export const allowedMonthlyPayrollStatuses = Object.values(MonthlyPayrollStatus);

/**
 * Payroll ID Prefix
 */
export const MONTHLY_PAYROLL_ID_PREFIX = 'PAY';
