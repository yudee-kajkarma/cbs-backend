import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * Nested DTO for employee user info in incentive
 */
export class IncentiveUserDto {
  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
}

/**
 * Nested DTO for employee info in incentive
 */
export class IncentiveEmployeeDto {
  @Expose()
  employeeId!: string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  @Type(() => IncentiveUserDto)
  userId?: IncentiveUserDto;
}

/**
 * Response DTO for Employee Incentive entity
 */
export class IncentiveResponseDto extends BaseDto {
  @Expose()
  incentiveId!: string;

  @Expose()
  @Type(() => IncentiveEmployeeDto)
  employeeId!: IncentiveEmployeeDto;

  @Expose()
  amount!: number;

  @Expose()
  month!: number;

  @Expose()
  year!: number;
}

/**
 * Response DTO for paginated incentive list
 */
export class GetAllIncentivesResponseDto {
  @Expose()
  @Type(() => IncentiveResponseDto)
  incentives!: IncentiveResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];

  @Expose()
  totalAmount!: number;
}
