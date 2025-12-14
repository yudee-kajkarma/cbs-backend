export enum HardwareType {
  LAPTOP = "Laptop",
  DESKTOP = "Desktop",
  SERVER = "Server",
  TABLET = "Tablet",
  WORKSTATION = "Workstation",
}

export enum OperatingSystem {
  WINDOWS_11_PRO = "Windows 11 Pro",
  WINDOWS_10_PRO = "Windows 10 Pro",
  MACOS_SONOMA = "macOS Sonoma",
  UBUNTU_SERVER_22_04 = "Ubuntu Server 22.04",
  UBUNTU_DESKTOP_22_04 = "Ubuntu Desktop 22.04",
  LINUX_OTHER = "Linux (Other)",
}

export enum RAM {
  GB_4 = "4GB",
  GB_8 = "8GB",
  GB_16 = "16GB",
  GB_32 = "32GB",
  GB_64 = "64GB",
  GB_128 = "128GB",
}

export enum Storage {
  SSD_128GB = "128GB SSD",
  SSD_256GB = "256GB SSD",
  SSD_512GB = "512GB SSD",
  SSD_1TB = "1TB SSD",
  SSD_2TB = "2TB SSD",
  RAID_2TB = "2TB RAID",
  RAID_4TB = "4TB RAID",
}

export enum HardwareStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  UNDER_REPAIR = "Under Repair",
  RETIRED = "Retired",
}

export const allowedHardwareTypes = Object.values(HardwareType);
export const allowedOperatingSystems = Object.values(OperatingSystem);
export const allowedRAMOptions = Object.values(RAM);
export const allowedStorageOptions = Object.values(Storage);
export const allowedHardwareStatuses = Object.values(HardwareStatus);
