export enum TransferType {
  TEMPORARY = "Temporary",
  PERMANENT = "Permanent",
}

export enum HardwareCondition {
  EXCELLENT = "Excellent",
  GOOD = "Good",
  FAIR = "Fair",
  POOR = "Poor",
}

export enum HardwareList {
  DELL_LATITUDE_7420 = "Dell Latitude 7420 (Laptop)",
  HP_ELITEDESK_800_G6 = "HP EliteDesk 800 G6 (Desktop)",
  MACBOOK_PRO_16 = "MacBook Pro 16\" (Laptop)",
  LENOVO_THINKPAD_T14 = "Lenovo ThinkPad T14 (Laptop)",
  DELL_MONITOR_27 = "Dell Monitor 27\" (Monitor)",
  IPAD_PRO_12_9 = "iPad Pro 12.9\" (Tablet)",
  HP_LASER_PRINTER = "HP Laser Printer (Printer)",
  DELL_POWEREDGE_R740 = "Dell PowerEdge R740 (Server)",
}

export enum TransferUserList {
  JOHN_SMITH_FINANCE = "John Smith - Finance",
  SARAH_JOHNSON_MARKETING = "Sarah Johnson - Marketing",
  MICHAEL_BROWN_OPERATIONS = "Michael Brown - Operations",
  AHMED_AL_RASHID_FINANCE = "Ahmed Al-Rashid - Finance",
  EMMA_WILSON_DESIGN = "Emma Wilson - Design",
  DAVID_LEE_SALES = "David Lee - Sales",
  IT_DEPARTMENT_IT = "IT Department - IT",
  UNASSIGNED_IT = "Unassigned - IT",
}

export enum TransferStatus {
  ACTIVE = "Active",
  RETURNED = "Returned",
  PERMANENT = "Permanent",
}

export const allowedTransferTypes = Object.values(TransferType);
export const allowedHardwareConditions = Object.values(HardwareCondition);
export const allowedHardwareList = Object.values(HardwareList);
export const allowedTransferUsers = Object.values(TransferUserList);
export const allowedTransferStatuses = Object.values(TransferStatus);
