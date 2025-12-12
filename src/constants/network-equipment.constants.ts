export enum EquipmentType {
  ROUTER = "Router",
  SWITCH = "Switch",
  FIREWALL = "Firewall",
  ACCESS_POINT = "Access Point",
  LOAD_BALANCER = "Load Balancer",
  MODEM = "Modem",
  OTHER = "Other",
}

export enum EquipmentStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  MAINTENANCE = "Maintenance",
  FAULTY = "Faulty",
  RETIRED = "Retired",
}

export const allowedEquipmentTypes = Object.values(EquipmentType);
export const allowedEquipmentStatuses = Object.values(EquipmentStatus);
