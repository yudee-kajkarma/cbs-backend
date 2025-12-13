import { Condition } from './common.constants';

/**
 * Equipment Category Enum
 */
export enum EquipmentCategory {
  OFFICE_EQUIPMENT = "Office Equipment",
  IT_EQUIPMENT = "IT Equipment",
  HEAVY_EQUIPMENT = "Heavy Equipment",
  POWER_EQUIPMENT = "Power Equipment",
  MEDICAL_EQUIPMENT = "Medical Equipment",
  LABORATORY_EQUIPMENT = "Laboratory Equipment",
  MANUFACTURING_EQUIPMENT = "Manufacturing Equipment",
}

/**
 * Use common Condition enum for equipment
 */
export { Condition as EquipmentCondition };

/**
 * General Equipment Status Enum (for general equipment tracking)
 */
export enum GeneralEquipmentStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  UNDER_MAINTENANCE = "Under Maintenance",
  DISPOSED = "Disposed",
}
