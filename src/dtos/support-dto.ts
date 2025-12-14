import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { SupportCategory, Priority as SupportPriority, SupportAssignee as AssignedTo, SupportStatus } from '../constants';
import { Department as SupportDepartment } from '../constants';

/**
 * Response DTO for Support Ticket entity
 */
export class SupportResponseDto extends BaseDto {
  @Expose()
  ticketTitle!: string;

  @Expose()
  category!: SupportCategory;

  @Expose()
  priority!: SupportPriority;

  @Expose()
  department!: SupportDepartment;

  @Expose()
  assignTo!: AssignedTo;

  @Expose()
  description!: string;

  @Expose()
  submittedBy!: string;

  @Expose()
  status!: SupportStatus;
}

/**
 * Response DTO for paginated support tickets list
 */
export class GetAllSupportTicketsResponseDto {
  @Expose()
  @Type(() => SupportResponseDto)
  tickets!: SupportResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
