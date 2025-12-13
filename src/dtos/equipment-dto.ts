import { Expose, Type } from "class-transformer";
import { BaseDto } from "./base-dto";
import { PaginationResult } from '../services/pagination.service';

export class EquipmentResponseDto extends BaseDto {
  @Expose()
  equipmentName!: string;

  @Expose()
  category!: string;

  @Expose()
  manufacturer?: string;

  @Expose()
  equipmentModel?: string;

  @Expose()
  serialNumber!: string;

  @Expose()
  condition?: string;

  @Expose()
  location!: string;

  @Expose()
  assignedTo?: string;

  @Expose()
  purchaseDate?: Date;

  @Expose()
  purchaseValue?: number;

  @Expose()
  purchaseCurrency?: string;

  @Expose()
  currentValue?: number;

  @Expose()
  currentCurrency?: string;

  @Expose()
  warrantyProvider?: string;

  @Expose()
  warrantyExpiry?: Date;

  @Expose()
  lastMaintenanceDate?: Date;

  @Expose()
  nextMaintenanceDate?: Date;

  @Expose()
  maintenanceContract?: string;

  @Expose()
  status!: string;

  @Expose()
  technicalSpecifications?: string;

  @Expose()
  notes?: string;
}

export class GetAllEquipmentResponseDto {
  @Expose()
  @Type(() => EquipmentResponseDto)
  equipment!: EquipmentResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
