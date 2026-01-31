import { Priority } from './common.constants';

export enum SupportCategory {
  NONE = "None",
  HARDWARE = "Hardware",
  SOFTWARE = "Software",
  NETWORK = "Network",
  EMAIL = "Email",
  ACCESS_CONTROL = "Access Control",
  PRINTER = "Printer",
  PHONE = "Phone",
  OTHER = "Other",
}
export { Priority };

export enum SupportAssignee {
  UNASSIGNED = "Unassigned",
  MARK_WILSON = "Mark Wilson",
  JAMES_CHEN = "James Chen",
  SARAH_MITCHELL = "Sarah Mitchell",
}

export enum SupportStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

export const allowedSupportCategories = Object.values(SupportCategory);
export const allowedSupportAssignees = Object.values(SupportAssignee);
export const allowedSupportStatuses = Object.values(SupportStatus);
