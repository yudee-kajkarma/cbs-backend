import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * Nested DTO for employee user info in bonus
 */
export class BonusUserDto {
  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
}

/**
 * Nested DTO for employee info in bonus
 */
export class BonusEmployeeDto {
  @Expose()
  employeeId!: string;

  @Expose()
  position?: string;

  @Expose()
  department?: string;

  @Expose()
  @Type(() => BonusUserDto)
  userId?: BonusUserDto;
}

/**
 * Response DTO for Employee Bonus entity
 */
export class BonusResponseDto extends BaseDto {
  @Expose()
  bonusId!: string;

  @Expose()
  @Type(() => BonusEmployeeDto)
  employeeId!: BonusEmployeeDto;

  @Expose()
  amount!: number;

  @Expose()
  month!: number;

  @Expose()
  year!: number;
}

/**
 * Response DTO for paginated bonus list
 */
export class GetAllBonusesResponseDto {
  @Expose()
  @Type(() => BonusResponseDto)
  bonuses!: BonusResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];

  @Expose()
  totalAmount!: number;
}
