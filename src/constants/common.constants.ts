export enum Currency {
  KWD = "KWD",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AED = "AED",
  SAR = "SAR",
}

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

export const allowedCurrencies = Object.values(Currency);
export const allowedDepartments = Object.values(Department);
