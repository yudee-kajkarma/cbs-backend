export enum EquipmentType {
  ROUTER = "Router",
  SWITCH = "Switch",
  FIREWALL = "Firewall",
  ACCESS_POINT = "Access Point",
  LOAD_BALANCER = "Load Balancer",
  GATEWAY = "Gateway"
}

export enum EquipmentStatus {
  ONLINE = "Online",
  OFFLINE = "Offline",
  MAINTENANCE = "Maintenance",
  DECOMMISSIONED = "Decommissioned",
}

export const allowedEquipmentTypes = Object.values(EquipmentType);
export const allowedEquipmentStatuses = Object.values(EquipmentStatus);
