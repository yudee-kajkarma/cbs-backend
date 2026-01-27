import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * Address DTO for tenant address
 */
export class TenantAddressDto {
  @Expose()
  city?: string;

  @Expose()
  state?: string;

  @Expose()
  country?: string;

  @Expose()
  zipCode?: string;
}

/**
 * Admin User DTO for tenant creation response
 */
export class TenantAdminUserDto {
  @Expose()
  username!: string;

  @Expose()
  email!: string;

  @Expose()
  fullName!: string;

  @Expose()
  role!: string;

  @Expose()
  message!: string;
}

/**
 * Tenant Response DTO
 */
export class TenantResponseDto extends BaseDto {
  @Expose()
  tenantRefId!: string;

  @Expose()
  companyName!: string;

  @Expose()
  companyEmail!: string;

  @Expose()
  companyPhone!: string;

  @Expose()
  @Type(() => TenantAddressDto)
  address?: TenantAddressDto;

  @Expose()
  status!: string;
}

/**
 * Response DTO for paginated tenant list
 */
export class GetAllTenantsResponseDto {
  @Expose()
  @Type(() => TenantResponseDto)
  tenants!: TenantResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}

/**
 * Tenant Creation Response DTO
 */
export class TenantCreationResponseDto {
  @Expose()
  @Type(() => TenantResponseDto)
  tenant!: TenantResponseDto;

  @Expose()
  @Type(() => TenantAdminUserDto)
  adminUser!: TenantAdminUserDto;
}

/**
 * Tenant Stats Response DTO
 */
export class TenantStatsResponseDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  suspended!: number;

  @Expose()
  pending!: number;

  @Expose()
  deleted!: number;

  @Expose()
  recentlyCreated!: number;
}
