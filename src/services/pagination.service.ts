import { PaginationParams, PaginationResult, PaginationOptions } from '../interfaces';

/**
 * Pagination Service - INVENTORY_MANAGEMENT Pattern
 * Use this in services for advanced pagination with search, filters, and sorting
 */
export type { PaginationParams, PaginationResult, PaginationOptions };

export class PaginationService {
  static async paginate<T>(
    model: {
      find: (filter: Record<string, any>) => any;
      countDocuments: (filter: Record<string, any>) => Promise<number>;
    },
    query: Record<string, any>,
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const params = this.parseParams(query);
    const filter = this.buildFilter(params, options.searchFields, options.additionalFilters, options.filterFields);
    const sort = this.buildSort(params, options.allowedSortFields);
    const skip = (params.page - 1) * params.limit;

    let findQuery = model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(params.limit)
      .populate(options.populateOptions || []);

    if (options.select) {
      findQuery = findQuery.select(options.select);
    }

    const [data, totalCount] = await Promise.all([findQuery.lean(), model.countDocuments(filter)]);

    return this.formatResponse(data, totalCount, params, options.filterFields);
  }

  private static parseParams(query: Record<string, any>): PaginationParams {
    const params: PaginationParams = {
      page: parseInt(query.page as string, 10) || 1,
      limit: parseInt(query.limit as string, 10) || 10,
      sortBy: query.sortBy || query.orderBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      search: query.search || undefined,
    };

    Object.keys(query).forEach(key => {
      if (!['page', 'limit', 'sortBy', 'sortOrder', 'orderBy', 'search'].includes(key)) {
        params[key] = query[key];
      }
    });

    return params;
  }

  private static buildFilter(
    params: PaginationParams,
    searchFields: string[],
    additionalFilters?: Record<string, any>,
    filterFields?: string[]
  ): Record<string, any> {
    const filter: Record<string, any> = { ...additionalFilters };

    if (params.search && searchFields.length > 0) {
      if (filter.$or && Array.isArray(filter.$or)) {
        const searchOr = searchFields.map(field => ({
          [field]: { $regex: params.search, $options: 'i' },
        }));
        filter.$or = [...filter.$or, ...searchOr];
      } else {
        filter.$or = searchFields.map(field => ({
          [field]: { $regex: params.search, $options: 'i' },
        }));
      }
    }

    if (filterFields) {
      filterFields.forEach(field => {
        if (params[field] !== undefined && params[field] !== null && params[field].toString().trim() !== '') {
          const value = params[field];
          if (typeof value === 'string' && ['true', 'false'].includes(value)) {
            filter[field] = value === 'true';
          } else {
            filter[field] = value;
          }
        }
      });
    }

    return filter;
  }

  private static buildSort(params: PaginationParams, allowedSortFields: string[]): Record<string, any> {
    const sort: Record<string, any> = {};

    if (allowedSortFields.includes(params.sortBy)) {
      sort[params.sortBy] = params.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return sort;
  }

  private static formatResponse<T>(
    data: T[],
    totalCount: number,
    params: PaginationParams,
    filterFields?: string[]
  ): PaginationResult<T> {
    const totalPages = Math.ceil(totalCount / params.limit);

    const filters: PaginationResult<T>['filters'] = {
      search: params.search || null,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    };

    if (filterFields) {
      filterFields.forEach(field => {
        (filters as any)[field] = params[field] !== undefined ? params[field] : null;
      });
    }

    return {
      data,
      pagination: {
        currentPage: params.page,
        totalPages,
        totalCount,
        limit: params.limit,
        hasNextPage: params.page < totalPages,
        hasPrevPage: params.page > 1,
      },
      filters,
    };
  }
}
