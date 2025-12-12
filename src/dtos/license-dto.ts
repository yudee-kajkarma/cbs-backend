import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { FileDto, PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { LicenseStatus } from '../constants';

/**
 * Response DTO for License entity
 */
export class LicenseResponseDto extends BaseDto {
  @Expose()
  name!: string;

  @Expose()
  number!: string;

  @Expose()
  issueDate!: Date;

  @Expose()
  expiryDate!: Date;

  @Expose()
  issuingAuthority!: string;

  @Expose()
  documentKey?: string;

  @Expose()
  @Type(() => FileDto)
  document?: FileDto;

  @Expose()
  status?: LicenseStatus;
}

/**
 * Response DTO for paginated license list
 */
export class GetAllLicensesResponseDto {
  @Expose()
  @Type(() => LicenseResponseDto)
  licenses!: LicenseResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
