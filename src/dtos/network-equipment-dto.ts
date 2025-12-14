import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationDto } from './common-dto';
import { PaginationResult } from '../services/pagination.service';
import { EquipmentType, EquipmentStatus as NetworkEquipmentStatus } from '../constants';

/**
 * Response DTO for Network Equipment entity
 */
export class NetworkEquipmentResponseDto extends BaseDto {
  @Expose()
  equipmentName!: string;

  @Expose()
  equipmentType!: EquipmentType;

  @Expose()
  ipAddress?: string;

  @Expose()
  macAddress!: string;

  @Expose()
  serialNumber!: string;

  @Expose()
  numberOfPorts!: number;

  @Expose()
  location!: string;

  @Expose()
  purchaseDate!: Date;

  @Expose()
  warrantyExpiry!: Date;

  @Expose()
  firmwareVersion!: string;

  @Expose()
  status!: NetworkEquipmentStatus;
}

/**
 * Response DTO for paginated network equipment list
 */
export class GetAllNetworkEquipmentResponseDto {
  @Expose()
  @Type(() => NetworkEquipmentResponseDto)
  networkEquipments!: NetworkEquipmentResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
