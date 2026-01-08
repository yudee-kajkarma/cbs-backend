import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';

/**
 * Response DTO for Activity Log entity
 */
export class ActivityLogResponseDto extends BaseDto {
  @Expose()
  userId!: string;

  @Expose()
  employeeId?: string;

  @Expose()
  activityType!: string;

  @Expose()
  action!: string;

  @Expose()
  module!: string;

  @Expose()
  entityType?: string;

  @Expose()
  entityId?: string;

  @Expose()
  description!: string;

  @Expose()
  metadata?: Record<string, any>;
}
