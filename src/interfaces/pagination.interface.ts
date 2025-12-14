/**
 * Pagination Parameters Interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Pagination Result Interface
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search: string | null;
    sortBy: string;
    sortOrder: string;
    [key: string]: any;
  };
}

/**
 * Pagination Options Interface
 */
export interface PaginationOptions {
  searchFields: string[];
  allowedSortFields: string[];
  populateOptions?: Array<{
    path: string;
    select?: string;
    populate?: Array<{ path: string; select?: string }>;
  }>;
  additionalFilters?: Record<string, any>;
  filterFields?: string[];
  select?: string;
}
