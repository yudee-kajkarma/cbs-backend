export enum LicenseType {
  SUBSCRIPTION = "Subscription",
  PERPETUAL = "Perpetual",
  TRIAL = "Trial",
  EDUCATIONAL = "Educational",
}

export enum SoftwareStatus {
  ACTIVE = "Active",
  EXPIRING_SOON = "Expiring Soon",
  EXPIRED = "Expired",
  SUSPENDED = "Suspended",
}

export enum LicenseStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  EXPIRING_SOON = 'Expiring Soon'
}

export const allowedLicenseTypes = Object.values(LicenseType);
export const allowedSoftwareStatuses = Object.values(SoftwareStatus);
export const allowedLicenseStatuses = Object.values(LicenseStatus);
