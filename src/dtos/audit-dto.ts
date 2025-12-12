import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { FileDto, PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { AuditType } from '../constants';

/**
 * Response DTO for Audit entity
 */
export class AuditResponseDto extends BaseDto {
  @Expose()
  name!: string;

  @Expose()
  type!: AuditType;

  @Expose()
  periodStart!: Date;

  @Expose()
  periodEnd!: Date;

  @Expose()
  auditor!: string;

  @Expose()
  completionDate!: Date;

  @Expose()
  @Type(() => FileDto)
  file?: FileDto;

  @Expose()
  status?: string;

  @Expose()
  documentUrl?: string;

  @Expose()
  hasFile?: boolean;
}

/**
 * Response DTO for paginated audit list
 */
export class GetAllAuditsResponseDto {
  @Expose()
  @Type(() => AuditResponseDto)
  audits!: AuditResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
