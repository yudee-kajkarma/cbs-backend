export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  ON_LEAVE = 'On Leave',
  LATE = 'Late',
}

export const allowedAttendanceStatuses = Object.values(AttendanceStatus);

export enum AttendanceFilterStatus {
  ALL = 'All',
  CHECKED_IN = 'Checked In',
  CHECKED_OUT = 'Checked Out',
  NOT_MARKED = 'Not Marked',
  ON_LEAVE = 'On Leave',
  LATE = 'Late',
}

export const allowedAttendanceFilterStatuses = Object.values(AttendanceFilterStatus);

export const ATTENDANCE_ID_PREFIX = 'ATT';

// Salary calculation status
export enum SalaryStatus {
  FULL = 'Full',
  DEDUCTED = 'Deducted',
  ZERO = 'Zero'
}

export const allowedSalaryStatuses = Object.values(SalaryStatus);

// SSE Event Types
export enum SSEEventType {
  CONNECTED = 'connected',
  CHECK_IN = 'check-in',
  CHECK_OUT = 'check-out',
  SUMMARY_UPDATE = 'summary-update',
  HEARTBEAT = 'heartbeat',
}

// SSE Event Interfaces
export interface SSECheckInEvent {
  empId: string;
  name: string;
  department: string;
  checkInTime: string;
  timestamp: string;
}

export interface SSECheckOutEvent {
  empId: string;
  name: string;
  department: string;
  checkOutTime: string;
  hoursWorked: number;
  timestamp: string;
}

export interface SSESummaryUpdateEvent {
  summary: {
    totalStaff: number;
    checkedIn: number;
    checkedOut: number;
    notMarked: number;
    onLeave: number;
    present: number;
    attendancePercent: number;
  };
  timestamp: string;
}
