import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * DTO for Leave Balance Item
 */
export class LeaveBalanceItemDto {
  @Expose()
  totalAllocation!: number;

  @Expose()
  used!: number;

  @Expose()
  remaining!: number;
}

/**
 * DTO for Unpaid Leave Balance Item
 */
export class UnpaidLeaveBalanceItemDto {
  @Expose()
  totalAllowed!: number;

  @Expose()
  used!: number;

  @Expose()
  remaining!: number;
}

/**
 * DTO for Employee Info in Leave Balance
 */
export class LeaveBalanceEmployeeDto {
  @Expose({ name: '_id' })
  id!: string;

  @Expose()
  employeeId!: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  email?: string;
}

/**
 * Response DTO for Leave Balance entity
 */
export class LeaveBalanceResponseDto extends BaseDto {
  @Expose()
  @Type(() => LeaveBalanceEmployeeDto)
  employeeId!: LeaveBalanceEmployeeDto;

  @Expose()
  year!: number;

  @Expose()
  @Type(() => LeaveBalanceItemDto)
  annualLeave!: LeaveBalanceItemDto;

  @Expose()
  @Type(() => LeaveBalanceItemDto)
  sickLeave!: LeaveBalanceItemDto;

  @Expose()
  @Type(() => LeaveBalanceItemDto)
  emergencyLeave!: LeaveBalanceItemDto;

  @Expose()
  @Type(() => UnpaidLeaveBalanceItemDto)
  unpaidLeave!: UnpaidLeaveBalanceItemDto;
}

/**
 * Response DTO for paginated leave balance list
 */
export class GetAllLeaveBalancesResponseDto {
  @Expose()
  @Type(() => LeaveBalanceResponseDto)
  leaveBalances!: LeaveBalanceResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
