export enum LeaveType {
    ANNUAL_LEAVE = "Annual Leave",
    SICK_LEAVE = "Sick Leave",
    EMERGENCY_LEAVE = "Emergency Leave",
    MATERNITY_LEAVE = "Maternity Leave",
    PATERNITY_LEAVE = "Paternity Leave",
    UNPAID_LEAVE = "Unpaid Leave"
}

export const allowedLeaveTypes = Object.values(LeaveType);

export enum LeaveApplicationStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected"
}

export const allowedLeaveApplicationStatuses = Object.values(LeaveApplicationStatus);

