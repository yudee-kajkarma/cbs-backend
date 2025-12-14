import { Expose, Type } from 'class-transformer';
import { Currency, Department } from '../constants';

export { Currency, Department };

/**
 * Common DTO for file/document references
 */
export class FileDto {
  @Expose()
  url!: string;

  @Expose()
  key!: string;

  @Expose()
  filename?: string;

  @Expose()
  mimetype?: string;

  @Expose()
  size?: number;
}

/**
 * Common DTO for pagination metadata
 */
export class PaginationDto {
  @Expose()
  currentPage!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  totalCount!: number;

  @Expose()
  limit!: number;

  @Expose()
  hasNextPage!: boolean;

  @Expose()
  hasPrevPage!: boolean;
}

/**
 * Common DTO for filter metadata
 */
export class FiltersDto {
  @Expose()
  search!: string | null;

  @Expose()
  sortBy!: string;

  @Expose()
  sortOrder!: string;

  [key: string]: any; 
}

/**
 * Common DTO for currency information
 */
export class CurrencyDto {
  @Expose()
  amount!: number;

  @Expose()
  currency!: string;
}
