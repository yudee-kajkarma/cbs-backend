import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';

/**
 * DTO for Attendance Status on Dashboard
 */
export class DashboardAttendanceStatusDto {
  @Expose()
  isCheckedIn!: boolean;

  @Expose()
  checkInTime?: Date;

  @Expose()
  checkOutTime?: Date;

  @Expose()
  status!: string;
}

/**
 * DTO for Attendance Rate on Dashboard
 */
export class DashboardAttendanceRateDto {
  @Expose()
  presentDays!: number;

  @Expose()
  totalWorkingDays!: number;

  @Expose()
  attendancePercentage!: number;
}

/**
 * DTO for Monthly Overview on Dashboard
 */
export class DashboardMonthlyOverviewDto {
  @Expose()
  daysPresent!: number;

  @Expose()
  daysAbsent!: number;

  @Expose()
  leaveBalance!: number;

  @Expose()
  totalWorkingDays!: number;
}

/**
 * DTO for Working Hours on Dashboard
 */
export class DashboardWorkingHoursDto {
  @Expose()
  totalHours!: number;

  @Expose()
  targetHours!: number;

  @Expose()
  averageDaily!: number;

  @Expose()
  expectedDaily!: number;

  @Expose()
  todayHours!: number;
}

/**
 * DTO for Leave Balance Item
 */
export class DashboardLeaveBalanceItemDto {
  @Expose()
  totalAllocation!: number;

  @Expose()
  used!: number;

  @Expose()
  remaining!: number;

  @Expose()
  pending!: number;
}

/**
 * DTO for Leave Summary on Dashboard
 */
export class DashboardLeaveSummaryDto {
  @Expose()
  @Type(() => DashboardLeaveBalanceItemDto)
  annualLeave!: DashboardLeaveBalanceItemDto;

  @Expose()
  @Type(() => DashboardLeaveBalanceItemDto)
  sickLeave!: DashboardLeaveBalanceItemDto;

  @Expose()
  @Type(() => DashboardLeaveBalanceItemDto)
  emergencyLeave!: DashboardLeaveBalanceItemDto;

  @Expose()
  totalAllocated!: number;

  @Expose()
  totalUsed!: number;

  @Expose()
  totalRemaining!: number;

  @Expose()
  totalPending!: number;
}

/**
 * DTO for Upcoming Leave Item
 */
export class DashboardUpcomingLeaveDto {
  @Expose()
  leaveType!: string;

  @Expose()
  startDate!: Date;

  @Expose()
  endDate!: Date;

  @Expose()
  numberOfDays!: number;
}

/**
 * DTO for Leave Application Item on Dashboard
 */
export class DashboardLeaveApplicationDto {
  @Expose()
  requestId!: string;

  @Expose()
  leaveType!: string;

  @Expose()
  startDate!: Date;

  @Expose()
  endDate!: Date;

  @Expose()
  numberOfDays!: number;

  @Expose()
  status!: string;

  @Expose()
  submittedDate!: Date;

  @Expose()
  approvedBy?: string;

  @Expose()
  approvalDate?: Date;

  @Expose()
  reason?: string;
}

/**
 * Main Dashboard User Response DTO
 */
export class DashboardUserResponseDto extends BaseDto {
  @Expose()
  employeeId!: string;

  @Expose()
  fullName!: string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  @Type(() => DashboardAttendanceStatusDto)
  attendanceStatus!: DashboardAttendanceStatusDto;

  @Expose()
  @Type(() => DashboardAttendanceRateDto)
  attendanceRate!: DashboardAttendanceRateDto;

  @Expose()
  @Type(() => DashboardMonthlyOverviewDto)
  monthlyOverview!: DashboardMonthlyOverviewDto;

  @Expose()
  @Type(() => DashboardWorkingHoursDto)
  workingHours!: DashboardWorkingHoursDto;

  @Expose()
  @Type(() => DashboardLeaveSummaryDto)
  leaveSummary!: DashboardLeaveSummaryDto;

  @Expose()
  @Type(() => DashboardUpcomingLeaveDto)
  upcomingLeaves!: DashboardUpcomingLeaveDto[];

  @Expose()
  @Type(() => DashboardLeaveApplicationDto)
  myLeaveApplications!: DashboardLeaveApplicationDto[];
}
