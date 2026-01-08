import Forecast from "../models/forecast.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  ForecastQuery, 
  CreateForecastData, 
  UpdateForecastData 
} from "../interfaces/model.interface";
import { ForecastType } from "../constants/forecast.constants";
import { parseForecastCsv } from "../utils/forecast-csv-parser.util";
import { CurrencyConverter } from "../utils/currency-converter.util";

export class  ForecastService {
  /**
   * Helper method to convert forecast amount to USD
   */
  private static async convertToUSD(forecast: any): Promise<any> {
    const result = { ...forecast };
    
    if (forecast.amount && forecast.currency) {
      result.amountUSD = await CurrencyConverter.convertCurrencyWithFallback(
        forecast.amount,
        forecast.currency,
        'USD'
      );
    }
    
    return result;
  }

  /**
   * Create a new forecast entry
   */
  static async create(data: CreateForecastData): Promise<any> {
    try {
      const forecast = await Forecast.create(data);
      const forecastObj = forecast.toObject();
      return await this.convertToUSD(forecastObj);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'create', data });
    }
  }

  /**
   * Get all forecast entries with pagination and filtering
   */
  static async getAll(query: ForecastQuery): Promise<any> {
    try {
      const searchableFields = ['description', 'category'];
      const allowedSortFields = ['date', 'type', 'category', 'amount', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['type', 'category', 'status', 'bankAccount'];

      const additionalFilters: any = {};
      if (query.startDate || query.endDate) {
        additionalFilters.date = {};
        if (query.startDate) {
          additionalFilters.date.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          additionalFilters.date.$lte = new Date(query.endDate);
        }
      }

      const result = await PaginationService.paginate(Forecast, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
        additionalFilters,
      });

      // Convert all forecasts to USD
      const forecastsWithUSD = await Promise.all(
        result.data.map((forecast: any) => this.convertToUSD(forecast))
      );

      return {
        forecasts: forecastsWithUSD,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'getAll', query });
    }
  }

  /**
   * Get forecast by ID
   */
  static async getOne(id: string): Promise<any> {
    try {
      const forecast = await Forecast.findById(id).lean();
      
      if (!forecast) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_NOT_FOUND);
      }

      return await this.convertToUSD(forecast);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'getOne', id });
    }
  }

  /**
   * Update forecast by ID
   */
  static async update(id: string, data: UpdateForecastData): Promise<any> {
    try {
      const updated = await Forecast.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_NOT_FOUND);
      }

      return updated;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'update', id, data });
    }
  }

  /**
   * Delete forecast by ID
   */
  static async remove(id: string): Promise<void> {
    try {
      const deleted = await Forecast.findByIdAndDelete(id);
      
      if (!deleted) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_NOT_FOUND);
      }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'remove', id });
    }
  }

  /**
   * Get forecast summary/statistics
   */
  static async getSummary(query: ForecastQuery): Promise<any> {
    try {
      const filters: any = {};

      if (query.bankAccount) {
        filters.bankAccount = query.bankAccount;
      }
      if (query.status) {
        filters.status = query.status;
      }

      if (query.startDate || query.endDate) {
        filters.date = {};
        if (query.startDate) {
          filters.date.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          filters.date.$lte = new Date(query.endDate);
        }
      }

      const [inflowResult, outflowResult] = await Promise.all([
        Forecast.aggregate([
          { $match: { ...filters, type: ForecastType.INFLOW } },
          { $group: { _id: null, total: { $sum: '$amount' }, currency: { $first: '$currency' } } }
        ]),
        Forecast.aggregate([
          { $match: { ...filters, type: ForecastType.OUTFLOW } },
          { $group: { _id: null, total: { $sum: '$amount' }, currency: { $first: '$currency' } } }
        ])
      ]);

      const totalInflows = inflowResult[0]?.total || 0;
      const totalOutflows = outflowResult[0]?.total || 0;
      const currency = inflowResult[0]?.currency || outflowResult[0]?.currency || 'KWD';

      return {
        totalInflows,
        totalOutflows,
        netAmount: totalInflows - totalOutflows,
        currency,
        currentCashBalance: 0,
        projectedMonthEndCash: totalInflows - totalOutflows,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'getSummary', query });
    }
  }

  /**
   * Export forecasts to CSV
   */
  static async exportToCSV(query: ForecastQuery): Promise<string> {
    try {
      const filters: any = {};
      
      if (query.type) filters.type = query.type;
      if (query.category) filters.category = query.category;
      if (query.status) filters.status = query.status;
      if (query.bankAccount) filters.bankAccount = query.bankAccount;

      if (query.startDate || query.endDate) {
        filters.date = {};
        if (query.startDate) {
          filters.date.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          filters.date.$lte = new Date(query.endDate);
        }
      }

      const forecasts = await Forecast.find(filters)
        .sort({ date: -1 })
        .lean();

      // CSV Headers
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Bank Account', 'Status'];
      const rows = forecasts.map((f: any) => [
        new Date(f.date).toISOString().split('T')[0],
        f.type,
        f.category,
        `"${f.description.replace(/"/g, '""')}"`,
        f.amount,
        f.currency,
        `"${f.bankAccount || ''}"`,
        f.status
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return csv;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'exportToCSV', query });
    }
  }

  /**
   * Parse and validate CSV file content
   */
  static async parseAndValidateCsvFile(csvContent: string): Promise<any> {
    try {
      const result = await parseForecastCsv(csvContent);
      
      return {
        valid: result.errors.length === 0,
        forecasts: result.json,
        errors: result.errors,
        warnings: result.warnings,
        summary: {
          totalRows: result.json.length + result.errors.filter((e: any) => e.type === 'row').length,
          validRows: result.json.length,
          invalidRows: result.errors.filter((e: any) => e.type === 'row').length,
          hasColumnErrors: result.errors.some((e: any) => e.type === 'column'),
        },
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'parseAndValidateCsvFile' });
    }
  }

  /**
   * Bulk create forecasts from validated CSV data
   */
  static async bulkCreateFromCsv(data: CreateForecastData[]): Promise<any> {
    try {
      if (!data || data.length === 0) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.VALIDATION_FAILED);
      }

      const forecasts = await Forecast.insertMany(data);
      
      return {
        created: forecasts.length,
        forecasts: forecasts.map(f => f.toObject()),
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'bulkCreateFromCsv' });
    }
  }

}
