import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { Department, PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { HardwareType, OperatingSystem, RAM, Storage, HardwareStatus } from '../constants';

/**
 * Response DTO for Hardware entity
 */
export class NewHardwareResponseDto extends BaseDto {
  @Expose()
  deviceName!: string;

  @Expose()
  type!: HardwareType;

  @Expose()
  serialNumber!: string;

  @Expose()
  operatingSystem!: OperatingSystem;

  @Expose()
  processor?: string;

  @Expose()
  ram?: RAM;

  @Expose()
  storage?: Storage;

  @Expose()
  purchaseDate?: Date;

  @Expose()
  warrantyExpiry?: Date;

  @Expose()
  assignedTo?: string;

  @Expose()
  department?: Department;

  @Expose()
  status!: HardwareStatus;

  @Expose()
  submittedBy?: string;
}

/**
 * Response DTO for paginated hardware list
 */
export class GetAllNewHardwareResponseDto {
  @Expose()
  @Type(() => NewHardwareResponseDto)
  newHardwares!: NewHardwareResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
