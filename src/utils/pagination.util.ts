/**
 * Simple pagination utilities that work with existing services
 * Avoids duplication with PaginationService by focusing on parameter extraction
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Extract pagination parameters from query string
 * @param query - Express query object
 * @param defaults - Default values for pagination
 * @returns Parsed pagination parameters
 */
export function extractPaginationParams(query: any): PaginationParams {
  return {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder || 'desc',
  };
}

/**
 * Create standardized pagination response
 * @param data - Array of data items
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Formatted pagination response
 */
export function createPaginationResponse(data: any[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
