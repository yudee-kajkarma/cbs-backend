import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';
import { VehicleType, FuelType, VehicleStatus, VehicleDepartment } from '../constants/vehicle.constants';
import { Currency } from '../constants/common.constants';

/**
 * Response DTO for Vehicle entity
 */
export class VehicleResponseDto extends BaseDto {
  @Expose()
  vehicleName!: string;

  @Expose()
  makeBrand!: string;

  @Expose()
  vehicleModel?: string;

  @Expose()
  vehicleType!: VehicleType;

  @Expose()
  year!: number;

  @Expose()
  color?: string;

  @Expose()
  fuelType!: FuelType;

  @Expose()
  chassisNumber!: string;

  @Expose()
  engineNumber?: string;

  @Expose()
  plateNumber!: string;

  @Expose()
  registrationExpiry?: Date;

  @Expose()
  insuranceProvider?: string;

  @Expose()
  insuranceExpiry?: Date;

  @Expose()
  purchaseDate?: Date;

  @Expose()
  purchaseValue?: number;

  @Expose()
  purchaseCurrency?: Currency;

  @Expose()
  currentValue?: number;

  @Expose()
  currentCurrency?: Currency;

  @Expose()
  depreciationCost?: number;

  @Expose()
  maintenanceValue?: number;

  @Expose()
  assignedTo?: string;

  @Expose()
  department?: VehicleDepartment;

  @Expose()
  mileage?: number;

  @Expose()
  lastService?: Date;

  @Expose()
  nextService?: Date;

  @Expose()
  status!: VehicleStatus;

  @Expose()
  notes?: string;
}

/**
 * Response DTO for paginated vehicle list
 */
export class GetAllVehicleResponseDto {
  @Expose()
  @Type(() => VehicleResponseDto)
  vehicles!: VehicleResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
