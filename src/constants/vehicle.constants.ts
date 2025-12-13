/**
 * Vehicle Type Enum
 */
export enum VehicleType {
  SEDAN = "Sedan",
  SUV = "SUV",
  VAN = "Van",
  PICKUP_TRUCK = "Pickup Truck",
  BUS = "Bus",
    MOTORCYCLE = "Motorcycle",
}

/**
 * Fuel Type Enum
 */
export enum FuelType {
  PETROL = "Petrol",
  DIESEL = "Diesel",
  ELECTRIC = "Electric",
  HYBRID = "Hybrid",
  CNG = "CNG",
}

/**
 * Vehicle Status Enum
 */
export enum VehicleStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  UNDER_MAINTENANCE = "Under Maintenance",
  SOLD = "Sold",
  RETIRED = "Retired",
}

/**
 * Department Enum (reusing from common if needed)
 */
export enum VehicleDepartment {
  FLEET = "Fleet",
  MANAGEMENT = "Management",
  SALES = "Sales",
  OPERATIONS = "Operations",
  MARKETING = "Marketing",
  MAINTENANCE = "Maintenance",
}
