import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * Nested DTO for employee user info in payroll
 */
export class PayrollUserDto {
  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
}

/**
 * Nested DTO for employee info in payroll
 */
export class PayrollEmployeeDto {
  @Expose()
  employeeId!: string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  @Type(() => PayrollUserDto)
  userId?: PayrollUserDto;
}

/**
 * Response DTO for Monthly Payroll entity
 */
export class MonthlyPayrollResponseDto extends BaseDto {
  @Expose()
  payrollId!: string;

  @Expose()
  @Type(() => PayrollEmployeeDto)
  employeeId!: PayrollEmployeeDto;

  @Expose()
  month!: number;

  @Expose()
  year!: number;

  @Expose()
  totalSalary!: number;

  @Expose()
  basicSalary!: number;

  @Expose()
  attendancePercentage!: number;

  @Expose()
  workingDays!: number;

  @Expose()
  presentDays!: number;

  @Expose()
  absentDays!: number;

  @Expose()
  unpaidLeaveDays!: number;

  @Expose()
  paidLeaveDays!: number;

  @Expose()
  salaryDeduction!: number;

  @Expose()
  socialInsurance!: number;

  @Expose()
  totalDeductions!: number;

  @Expose()
  bonusAmount!: number;

  @Expose()
  incentiveAmount!: number;

  @Expose()
  overtimePay!: number;

  @Expose()
  netSalary!: number;

  @Expose()
  status!: string;

  @Expose()
  processedDate?: Date;

  @Expose()
  paidDate?: Date;
}

/**
 * Response DTO for paginated payroll list
 */
export class GetAllPayrollsResponseDto {
  @Expose()
  @Type(() => MonthlyPayrollResponseDto)
  payrolls!: MonthlyPayrollResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}

/**
 * Response DTO for process all payrolls
 */
export class ProcessAllPayrollsResponseDto {
  @Expose()
  processedCount!: number;

  @Expose()
  month!: number;

  @Expose()
  year!: number;
}
