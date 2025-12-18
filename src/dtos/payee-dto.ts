import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';
import { PayeeCategory } from '../constants/payee.constants';

/**
 * Response DTO for Payee entity
 */
export class PayeeResponseDto extends BaseDto {
  @Expose()
  name!: string;

  @Expose()
  company?: string;

  @Expose()
  category!: PayeeCategory;

  @Expose()
  phone?: string;

  @Expose()
  email?: string;

  @Expose()
  address?: string;

  @Expose()
  notes?: string;
}

/**
 * Response DTO for paginated payee list
 */
export class GetAllPayeesResponseDto {
  @Expose()
  @Type(() => PayeeResponseDto)
  payees!: PayeeResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
