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

export class ForecastService {
  /**
   * Create a new forecast entry
   */
  static async create(data: CreateForecastData): Promise<any> {
    try {
      const forecast = await Forecast.create(data);
      return forecast.toObject();
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

      return {
        forecasts: result.data,
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

      return forecast;
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
   * Import forecasts from CSV
   */
  static async importFromCSV(csvData: string): Promise<{ created: number; errors: string[] }> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_CSV_FORMAT);
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Bank Account', 'Status'];
      
      const hasAllHeaders = requiredHeaders.every(rh => 
        headers.some(h => h.toLowerCase() === rh.toLowerCase())
      );
      
      if (!hasAllHeaders) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_CSV_HEADERS);
      }

      const validatedData: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          if (values.length < 8) {
            errors.push(`Line ${i + 1}: Insufficient columns`);
            continue;
          }

          const [dateStr, type, category, description, amountStr, currency, bankAccountName, status] = values;

          const date = new Date(dateStr.trim());
          if (isNaN(date.getTime())) {
            errors.push(`Line ${i + 1}: Invalid date format`);
            continue;
          }

          const amount = parseFloat(amountStr.trim());
          if (isNaN(amount) || amount <= 0) {
            errors.push(`Line ${i + 1}: Invalid amount`);
            continue;
          }

          validatedData.push({
            date,
            type: type.trim(),
            category: category.trim(),
            description: description.trim(),
            amount,
            currency: currency.trim(),
            bankAccount: bankAccountName.trim(),
            status: status.trim(),
          });
        } catch (err: any) {
          errors.push(`Line ${i + 1}: ${err.message}`);
        }
      }

      // If any errors, don't import anything
      if (errors.length > 0) {
        return { created: 0, errors };
      }

      // Second pass: Insert all validated data
      const created = await Forecast.insertMany(validatedData);

      return { created: created.length, errors: [] };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'importFromCSV' });
    }
  }

  /**
   * Helper: Parse CSV line handling quoted values
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }
}
