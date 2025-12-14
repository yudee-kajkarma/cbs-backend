export enum SimCarrier {
  ZAIN_KUWAIT = "Zain Kuwait",
  OOREDOO_KUWAIT = "Ooredoo Kuwait",
  STC_KUWAIT = "STC Kuwait",
  OTHER = "Other",
}

export enum SimStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  SUSPENDED = "Suspended",
  EXPIRED = "Expired",
}

export const allowedSimCarriers = Object.values(SimCarrier);
export const allowedSimStatuses = Object.values(SimStatus);
