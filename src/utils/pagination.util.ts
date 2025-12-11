import { Model, FilterQuery, QueryOptions } from 'mongoose';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResult;
}


export const calculatePagination = (
  total: number,
  page: number,
  limit: number
): PaginationResult => {
  const totalPages = Math.ceil(total / limit);

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
 * Generic paginate function for Mongoose models
 */
export const paginate = async <T>(
  model: Model<T>,
  query: FilterQuery<T>,
  page: number,
  limit: number,
  sort: any = { createdAt: -1 }
): Promise<{ data: T[]; total: number }> => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limit).lean(),
    model.countDocuments(query),
  ]);

  return { data: data as T[], total };
};


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
