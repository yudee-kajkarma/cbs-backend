import Forecast from "../models/forecast.model";
import BankAccount from "../models/bankAccount.model";
import { PaginationService } from "./pagination.service";
import { throwError } from "../utils/errors.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { ERROR_MESSAGES } from "../constants/error-messages.constants";
import { 
  ForecastDocument,
  ForecastQuery, 
  CreateForecastData, 
  UpdateForecastData 
} from "../interfaces/model.interface";
import { ForecastType } from "../constants/forecast.constants";

export class ForecastService {
  /**
   * Helper: Format forecast for response
   */
  private static formatForecast(forecast: any) {
    return forecast;
  }

  /**
   * Create a new forecast entry
   */
  static async create(data: CreateForecastData): Promise<any> {
    try {
      const bankAccount = await BankAccount.findById(data.bankAccount);
      if (!bankAccount) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
      }

      const forecast = await Forecast.create(data);
      const populated = await Forecast.findById(forecast._id)
        .populate('bankAccount', 'bankName')
        .lean();

      return this.formatForecast(populated);
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
        populateOptions: [
          {
            path: 'bankAccount',
            select: 'bankName',
          },
        ],
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
      const forecast = await Forecast.findById(id)
        .populate('bankAccount', 'bankName')
        .lean();
      
      if (!forecast) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_NOT_FOUND);
      }

      return this.formatForecast(forecast);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'ForecastService', method: 'getOne', id });
    }
  }

  /**
   * Update forecast by ID
   */
  static async update(id: string, data: UpdateForecastData): Promise<any> {
    try {
      if (data.bankAccount) {
        const bankAccount = await BankAccount.findById(data.bankAccount);
        if (!bankAccount) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.BANK_ACCOUNT_NOT_FOUND);
        }
      }

      const updated = await Forecast.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      )
        .populate('bankAccount', 'bankName')
        .lean();

      if (!updated) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.FORECAST_NOT_FOUND);
      }

      return this.formatForecast(updated);
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
}
