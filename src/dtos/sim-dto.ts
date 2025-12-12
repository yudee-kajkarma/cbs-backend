import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { Currency, Department, PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';

export enum Carrier {
  ZAIN_KUWAIT = 'Zain Kuwait',
  OOREDOO_KUWAIT = 'Ooredoo Kuwait',
  STC_KUWAIT = 'STC Kuwait',
  OTHER = 'Other'
}

export enum SIMStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  EXPIRED = 'Expired'
}

/**
 * Response DTO for SIM Card entity
 */
export class SIMResponseDto extends BaseDto {
  @Expose()
  simNumber!: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  carrier!: Carrier;

  @Expose()
  planType?: string;

  @Expose()
  monthlyFee?: number;

  @Expose()
  currency?: Currency;

  @Expose()
  extraCharges?: number;

  @Expose()
  simCharges?: number;

  @Expose()
  dataLimit?: string;

  @Expose()
  activationDate?: Date;

  @Expose()
  expiryDate?: Date;

  @Expose()
  assignedTo?: string;

  @Expose()
  department?: Department;

  @Expose()
  deviceImei?: string;

  @Expose()
  status?: SIMStatus;

  @Expose()
  notes?: string;
}

/**
 * Response DTO for paginated SIM cards list
 */
export class GetAllSIMsResponseDto {
  @Expose()
  @Type(() => SIMResponseDto)
  sims!: SIMResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
