import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';

/**
 * DTO for Employee User Info nested in Attendance
 */
export class AttendanceUserDto {
  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
}

/**
 * DTO for Employee Info in Attendance
 */
export class AttendanceEmployeeDto {
  @Expose()
  employeeId!: string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  @Type(() => AttendanceUserDto)
  userId?: AttendanceUserDto;
}

/**
 * Response DTO for Attendance entity
 */
export class AttendanceResponseDto extends BaseDto {
  @Expose()
  attendanceId!: string;

  @Expose()
  @Type(() => AttendanceEmployeeDto)
  employeeId!: AttendanceEmployeeDto;

  @Expose()
  date!: Date;

  @Expose()
  checkInTime?: Date;

  @Expose()
  checkInIP?: string;

  @Expose()
  checkOutTime?: Date;

  @Expose()
  checkOutIP?: string;

  @Expose()
  workingHours!: number;

  @Expose()
  overtimeHours!: number;

  @Expose()
  isLateArrival!: boolean;

  @Expose()
  lateArrivalMinutes!: number;

  @Expose()
  status!: string;
}

/**
 * DTO for Daily Attendance Record
 */
export class DailyAttendanceRecordDto {
  @Expose()
  empId!: string;

  @Expose()
  name!: string;

  @Expose()
  department!: string;

  @Expose()
  position!: string;

  @Expose()
  checkIn!: string;

  @Expose()
  checkOut!: string;

  @Expose()
  hoursWorked!: number;

  @Expose()
  status!: string;

  @Expose()
  salaryStatus!: string;

  @Expose()
  deductionAmount!: number;

  @Expose()
  salaryForDay!: number;
}

/**
 * Attendance summary DTO
 */
export class AttendanceSummaryDto {
  @Expose()
  present!: number;

  @Expose()
  absent!: number;

  @Expose()
  onLeave!: number;

  @Expose()
  attendancePercent!: number;
}

/**
 * Salary rule item DTO
 */
export class SalaryRuleItemDto {
  @Expose()
  condition!: string;

  @Expose()
  threshold?: number;

  @Expose()
  percentage?: number;
}

/**
 * Salary rules DTO
 */
export class SalaryRulesDto {
  @Expose()
  @Type(() => SalaryRuleItemDto)
  fullSalary!: SalaryRuleItemDto;

  @Expose()
  @Type(() => SalaryRuleItemDto)
  deducted!: SalaryRuleItemDto;

  @Expose()
  @Type(() => SalaryRuleItemDto)
  zeroSalary!: SalaryRuleItemDto;
}

/**
 * Pagination DTO
 */
export class PaginationDto {
  @Expose()
  currentPage!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  totalCount!: number;

  @Expose()
  limit!: number;

  @Expose()
  hasNextPage!: boolean;

  @Expose()
  hasPrevPage!: boolean;
}

/**
 * Filters DTO
 */
export class AttendanceFiltersDto {
  @Expose()
  date!: string;

  @Expose()
  status!: string | null;

  @Expose()
  department!: string | null;
}

/**
 * Response DTO for Daily Summary
 */
export class DailySummaryResponseDto {
  @Expose()
  @Type(() => AttendanceSummaryDto)
  summary!: AttendanceSummaryDto;

  @Expose()
  @Type(() => SalaryRulesDto)
  salaryRules!: SalaryRulesDto;

  @Expose()
  @Type(() => DailyAttendanceRecordDto)
  records!: DailyAttendanceRecordDto[];

  @Expose()
  @Type(() => PaginationDto)
  pagination!: PaginationDto;

  @Expose()
  @Type(() => AttendanceFiltersDto)
  filters!: AttendanceFiltersDto;
}
