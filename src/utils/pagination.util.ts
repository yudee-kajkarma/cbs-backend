import { Model, FilterQuery, SortOrder } from 'mongoose';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, SortOrder> | string;
  lean?: boolean;
  select?: string;
}

/**
 * Calculate skip value for pagination
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Generic paginate function for Mongoose models with advanced options
 */
export const paginate = async <T>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  options: PaginationOptions = {}
): Promise<PaginatedResponse<T>> => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 as const },
    lean = true,
    select = '',
  } = options;

  const skip = calculateSkip(page, limit);

  // Build the query
  let queryBuilder = model.find(query).sort(sort).skip(skip).limit(limit);

  if (lean) {
    queryBuilder = queryBuilder.lean();
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  const [data, total] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(query),
  ]);

  return {
    data: data as T[],
    pagination: calculatePagination(total, page, limit),
  };
};

/**
 * Build a complete paginated response with custom data
 */
export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    data,
    pagination: calculatePagination(total, page, limit),
  };
};

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (
  page: number,
  limit: number
): { isValid: boolean; error?: string } => {
  if (page < 1) {
    return { isValid: false, error: 'Page must be greater than 0' };
  }
  if (limit < 1) {
    return { isValid: false, error: 'Limit must be greater than 0' };
  }
  if (limit > 100) {
    return { isValid: false, error: 'Limit cannot exceed 100' };
  }
  return { isValid: true };
};

/**
 * Parse sort parameters from query string
 * @param orderBy - Field to sort by (e.g., 'createdAt', 'name')
 * @param sortBy - Sort direction ('asc' or 'desc')
 * @returns Mongoose sort object
 */
export const parseSortParams = (
  orderBy: string = 'createdAt',
  sortBy: string = 'desc'
): Record<string, SortOrder> => {
  const sortDirection: SortOrder = sortBy === 'asc' ? 1 : -1;
  return { [orderBy]: sortDirection };
};
