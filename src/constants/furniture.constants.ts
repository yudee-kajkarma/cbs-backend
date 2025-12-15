import { Condition } from './common.constants';

export enum FurnitureCategory {
  OFFICE_FURNITURE = "Office Furniture",
  MEETING_ROOM_FURNITURE = "Meeting Room Furniture",
  STORAGE_FURNITURE = "Storage Furniture",
  LOUNGE_FURNITURE = "Lounge Furniture",
  RECEPTION_FURNITURE = "Reception Furniture",
  OUTDOOR_FURNITURE = "Outdoor Furniture",
}

// Use common Condition enum
export { Condition as FurnitureCondition };

export enum FurnitureStatus {
  ACTIVE = "Active",
  UNDER_REPAIR = "Under Repair",
  INACTIVE = "Inactive",
  DISPOSED = "Disposed",
}

export const allowedFurnitureCategories = Object.values(FurnitureCategory);
export const allowedFurnitureConditions = Object.values(Condition);
export const allowedFurnitureStatuses = Object.values(FurnitureStatus);
