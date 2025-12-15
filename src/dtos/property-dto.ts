import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';
import { PropertyType, PropertyUsage, Unit, OwnershipType, PropertyStatus } from '../constants/property.constants';
import { Currency } from '../constants/common.constants';

/**
 * Response DTO for Property entity
 */
export class PropertyResponseDto extends BaseDto {
  @Expose()
  propertyName!: string;

  @Expose()
  propertyType!: PropertyType;

  @Expose()
  location!: string;

  @Expose()
  area!: number;

  @Expose()
  unit!: Unit;

  @Expose()
  propertyUsage?: PropertyUsage;

  @Expose()
  numberOfFloors?: number;

  @Expose()
  ownershipType!: OwnershipType;

  @Expose()
  titleDeedNumber?: string;

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
  annualMaintenanceCost?: number;

  @Expose()
  insuranceExpiryDate?: Date;

  @Expose()
  status!: PropertyStatus;

  @Expose()
  notes?: string;
}

/**
 * Response DTO for paginated property list
 */
export class GetAllPropertyResponseDto {
  @Expose()
  @Type(() => PropertyResponseDto)
  properties!: PropertyResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
