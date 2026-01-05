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
 * DTO for Leave Summary on Dashboard
 */
export class DashboardLeaveSummaryDto {
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
 * DTO for Attendance Overview Response
 */
export class AttendanceOverviewResponseDto extends BaseDto {
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
}

/**
 * DTO for Leave Overview Response
 */
export class LeaveOverviewResponseDto extends BaseDto {
  @Expose()
  @Type(() => DashboardLeaveSummaryDto)
  leaveSummary!: DashboardLeaveSummaryDto;

  @Expose()
  @Type(() => DashboardUpcomingLeaveDto)
  upcomingLeaves!: DashboardUpcomingLeaveDto[];
}

/**
 * DTO for Leave Applications Overview Response
 */
export class LeaveApplicationsOverviewResponseDto extends BaseDto {
  @Expose()
  @Type(() => DashboardLeaveApplicationDto)
  myLeaveApplications!: DashboardLeaveApplicationDto[];
}



/**
 * DTO for Activity Log Metadata
 */
export class ActivityLogMetadataDto {
  @Expose()
  checkInTime?: string;

  @Expose()
  isLateArrival?: boolean;

  @Expose()
  lateArrivalMinutes?: number;

  @Expose()
  ipAddress?: string;
}

/**
 * DTO for Activity Log Item
 */
export class DashboardActivityLogDto {
  @Expose()
  activityType!: string;

  @Expose()
  action!: string;

  @Expose()
  description!: string;

  @Expose()
  module!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  @Type(() => ActivityLogMetadataDto)
  metadata?: ActivityLogMetadataDto;
}

/**
 * DTO for Activity Log Overview Response
 */
export class ActivityLogOverviewResponseDto extends BaseDto {
  @Expose()
  @Type(() => DashboardActivityLogDto)
  recentActivities!: DashboardActivityLogDto[];
}

/**
 * DTO for HR Dashboard Statistics
 */
export class HRStatisticsDto {
  @Expose()
  totalEmployees!: number;

  @Expose()
  presentToday!: number;

  @Expose()
  onLeaveToday!: number;

  @Expose()
  monthlyPayrollTotal!: number;
}

/**
 * DTO for HR Statistics Response
 */
export class HRStatisticsResponseDto extends BaseDto {
  @Expose()
  @Type(() => HRStatisticsDto)
  statistics!: HRStatisticsDto;
}

/**
 * DTO for HR Activity Feed Response
 */
export class HRActivityFeedResponseDto extends BaseDto {
  @Expose()
  @Type(() => DashboardActivityLogDto)
  recentActivities!: DashboardActivityLogDto[];
}
