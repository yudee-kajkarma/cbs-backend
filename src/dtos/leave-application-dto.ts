import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * DTO for User Info nested in Employee
 */
export class LeaveApplicationUserDto {
  @Expose()
  fullName!: string;

  @Expose()
  email!: string;

  @Expose()
  username!: string;
}

/**
 * DTO for Employee Info in Leave Application
 */
export class LeaveApplicationEmployeeDto {

  @Expose()
  employeeId!: string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  joinDate?: Date;

  @Expose()
  status?: string;

  @Expose()
  @Type(() => LeaveApplicationUserDto)
  userId?: LeaveApplicationUserDto;
}

/**
 * DTO for Approver Info in Leave Application
 */
export class LeaveApplicationApproverDto {
  @Expose({ name: '_id' })
  id!: string;

  @Expose()
  username!: string;

  @Expose()
  email?: string;

  @Expose()
  role!: string;
}

/**
 * Response DTO for Leave Application entity
 */
export class LeaveApplicationResponseDto extends BaseDto {
  @Expose()
  requestId!: string;

  @Expose()
  @Type(() => LeaveApplicationEmployeeDto)
  employeeId!: LeaveApplicationEmployeeDto;

  @Expose()
  leaveType!: string;

  @Expose()
  startDate!: Date;

  @Expose()
  endDate!: Date;

  @Expose()
  numberOfDays!: number;

  @Expose()
  reason!: string;

  @Expose()
  status!: string;

  @Expose()
  appliedOn!: Date;

  @Expose()
  @Type(() => LeaveApplicationApproverDto)
  approvedBy?: LeaveApplicationApproverDto;

  @Expose()
  actionDate?: Date;

  @Expose()
  rejectionReason?: string;
}

/**
 * Response DTO for paginated leave application list
 */
export class GetAllLeaveApplicationsResponseDto {
  @Expose()
  summary!: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };

  @Expose()
  @Type(() => LeaveApplicationResponseDto)
  leaveApplications!: LeaveApplicationResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
