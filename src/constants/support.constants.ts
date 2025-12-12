export enum SupportCategory {
  HARDWARE = "Hardware",
  SOFTWARE = "Software",
  NETWORK = "Network",
  EMAIL = "Email",
  ACCESS_CONTROL = "Access Control",
  PRINTER = "Printer",
  PHONE = "Phone",
  OTHER = "Other",
}

export enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

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
export const allowedPriorities = Object.values(Priority);
export const allowedSupportAssignees = Object.values(SupportAssignee);
export const allowedSupportStatuses = Object.values(SupportStatus);
