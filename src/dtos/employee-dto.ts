import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';
import { EmployeeStatus } from '../constants';

/**
 * User DTO for populated userId in Employee
 */
export class EmployeeUserDto {
  @Expose()
  userId!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: string;
}

/**
 * Response DTO for Employee entity
 */
export class EmployeeResponseDto extends BaseDto {
  @Expose()
  employeeId!: string;

  @Expose()
  @Type(() => EmployeeUserDto)
  userId!: EmployeeUserDto | string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  joinDate?: Date;

  @Expose()
  salary?: number;

  @Expose()
  status!: EmployeeStatus;
}

/**
 * Response DTO for paginated employee list
 */
export class GetAllEmployeesResponseDto {
  @Expose()
  @Type(() => EmployeeResponseDto)
  employees!: EmployeeResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
