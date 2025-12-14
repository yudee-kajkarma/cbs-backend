import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';

export enum LicenseType {
  SUBSCRIPTION = 'Subscription',
  PERPETUAL = 'Perpetual',
  TRIAL = 'Trial',
  EDUCATIONAL = 'Educational'
}

export enum SoftwareDepartment {
  ALL = 'All',
  IT = 'IT',
  FINANCE = 'Finance',
  HR = 'HR',
  OPERATIONS = 'Operations',
  SALES = 'Sales',
  MARKETING = 'Marketing',
  ENGINEERING = 'Engineering',
  LEGAL = 'Legal'
}

export enum SoftwareStatus {
  ACTIVE = 'Active',
  EXPIRING_SOON = 'Expiring Soon',
  EXPIRED = 'Expired',
  SUSPENDED = 'Suspended'
}

/**
 * Response DTO for Software License entity
 */
export class SoftwareResponseDto extends BaseDto {
  @Expose()
  name!: string;

  @Expose()
  vendor!: string;

  @Expose()
  licenseType!: LicenseType;

  @Expose()
  licenseKey!: string;

  @Expose()
  totalSeats!: number;

  @Expose()
  seatsUsed!: number;

  @Expose()
  purchaseDate!: Date;

  @Expose()
  expiryDate!: Date;

  @Expose()
  renewalCost!: string;

  @Expose()
  assignedDepartment!: SoftwareDepartment;

  @Expose()
  status?: SoftwareStatus;
}

/**
 * Response DTO for paginated software licenses list
 */
export class GetAllSoftwareResponseDto {
  @Expose()
  @Type(() => SoftwareResponseDto)
  softwares!: SoftwareResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
