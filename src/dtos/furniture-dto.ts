import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { Currency } from './common-dto';
import { PaginationResult } from '../interfaces/pagination.interface';
import { FurnitureCategory, FurnitureCondition, FurnitureStatus } from '../constants';

/**
 * Response DTO for Furniture entity
 */
export class FurnitureResponseDto extends BaseDto {
  @Expose()
  itemName!: string;

  @Expose()
  itemCode!: string;

  @Expose()
  category!: FurnitureCategory;

  @Expose()
  quantity!: number;

  @Expose()
  condition?: FurnitureCondition;

  @Expose()
  material?: string;

  @Expose()
  color?: string;

  @Expose()
  dimensions?: string;

  @Expose()
  location!: string;

  @Expose()
  assignedTo?: string;

  @Expose()
  supplier?: string;

  @Expose()
  purchaseDate?: Date;

  @Expose()
  unitValue?: number;

  @Expose()
  purchaseCurrency?: Currency;

  @Expose()
  currentUnitValue?: number;

  @Expose()
  currentCurrency?: Currency;

  @Expose()
  warrantyExpiry?: Date;

  @Expose()
  lastInspection?: Date;

  @Expose()
  status!: FurnitureStatus;

  @Expose()
  notes?: string;
}

/**
 * Response DTO for paginated furniture list
 */
export class GetAllFurnitureResponseDto {
  @Expose()
  @Type(() => FurnitureResponseDto)
  furnitures!: FurnitureResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
