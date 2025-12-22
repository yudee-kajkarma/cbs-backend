import { Expose } from 'class-transformer';
import { BaseDto } from './base-dto';

/**
 * Response DTO for Leave Policy entity
 */
export class LeavePolicyResponseDto extends BaseDto {
  @Expose()
  annualLeavePaid!: number;

  @Expose()
  sickLeavePaid!: number;

  @Expose()
  emergencyLeave!: number;

  @Expose()
  maternityLeave!: number;

  @Expose()
  paternityLeave!: number;

  @Expose()
  unpaidLeaveMax!: number;

  @Expose()
  allowCarryForward!: boolean;

  @Expose()
  maxCarryForwardDays!: number;

  @Expose()
  allowNegativeBalance!: boolean;

  @Expose()
  maxNegativeLeaveDays!: number;

  @Expose()
  isActive!: boolean;
}


