import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { FileDto, PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { DocumentCategory, DocumentStatus } from '../constants';

/**
 * Response DTO for Document entity
 */
export class DocumentResponseDto extends BaseDto {
  @Expose()
  name!: string;

  @Expose()
  category!: DocumentCategory;

  @Expose()
  documentDate!: Date;

  @Expose()
  partiesInvolved!: string;

  @Expose()
  status?: DocumentStatus;

  @Expose()
  @Type(() => FileDto)
  file?: FileDto;
}

/**
 * Response DTO for paginated document list
 */
export class GetAllDocumentsResponseDto {
  @Expose()
  @Type(() => DocumentResponseDto)
  documents!: DocumentResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
