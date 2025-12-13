import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { ISOStandard, ISOStatus } from '../constants';

/**
 * Response DTO for ISO Certificate entity
 */
export class ISOResponseDto extends BaseDto {
  @Expose()
  certificateName!: string;

  @Expose()
  isoStandard!: ISOStandard;

  @Expose()
  issueDate!: Date;

  @Expose()
  expiryDate!: Date;

  @Expose()
  certifyingBody!: string;

  @Expose()
  status?: ISOStatus;

  @Expose()
  fileKey?: string;

  @Expose()
  fileUrl?: string;
}

/**
 * Response DTO for paginated ISO certificates list
 */
export class GetAllISOResponseDto {
  @Expose()
  @Type(() => ISOResponseDto)
  isos!: ISOResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
