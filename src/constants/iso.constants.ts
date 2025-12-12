export enum ISOStandard {
  ISO_9001_2015 = 'ISO 9001:2015',
  ISO_14001_2015 = 'ISO 14001:2015',
  ISO_27001_2013 = 'ISO 27001:2013',
  ISO_45001_2018 = 'ISO 45001:2018',
  ISO_50001_2018 = 'ISO 50001:2018'
}

export enum ISOStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  EXPIRING_SOON = 'Expiring Soon'
}

export const allowedISOStandards = Object.values(ISOStandard);
export const allowedISOStatuses = Object.values(ISOStatus);
