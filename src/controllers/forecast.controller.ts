import { Request, Response } from "express";
import { ForecastService } from "../services/forecast.service";
import { ForecastResponseDto, ForecastSummaryDto } from "../dtos/forecast-dto";
import { ErrorHandler } from "../utils/error-handler.util";
import { ResponseUtil } from "../utils/response-formatter.util";
import { toDto, toDtoList } from "../utils/dto-mapper.util";
import { INFO_MESSAGES } from '../constants/info-messages.constants';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { throwError } from '../utils/errors.util';

export class ForecastController {
  /**
   * Create a new forecast entry
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await ForecastService.create(req.body);
      const dto = toDto(ForecastResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.CREATED_SUCCESSFULLY, dto);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'create', data: req.body });
    }
  }

  /**
   * Get all forecast entries with pagination and filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await ForecastService.getAll(req.query);
      const forecastDto = toDtoList(ForecastResponseDto, result.forecasts);
      const responseData = {
        forecasts: forecastDto,
        pagination: result.pagination,
        filters: result.filters
      };
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.LIST_RETRIEVED_SUCCESSFULLY, responseData);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAll', query: req.query });
    }
  }

  /**
   * Get forecast by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ForecastService.getOne(id);
      const dto = toDto(ForecastResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getById', id: req.params.id });
    }
  }

  /**
   * Update forecast by ID
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ForecastService.update(id, req.body);
      const dto = toDto(ForecastResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.UPDATED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'update', id: req.params.id, data: req.body });
    }
  }

  /**
   * Delete forecast by ID
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ForecastService.remove(id);
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.DELETED_SUCCESSFULLY, null);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'delete', id: req.params.id });
    }
  }

  /**
   * Get forecast summary/statistics
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const result = await ForecastService.getSummary(req.query);
      const dto = toDto(ForecastSummaryDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.SUMMARY_RETRIEVED_SUCCESSFULLY, dto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getSummary', query: req.query });
    }
  }

  /**
   * Export forecasts to CSV
   */
  static async exportCSV(req: Request, res: Response): Promise<void> {
    try {
      const csv = await ForecastService.exportToCSV(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="forecasts_${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'exportCSV', query: req.query });
    }
  }

  /**
   * Upload and import CSV file
   * Validates CSV and creates database entries
   */
  static async uploadCsvFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.VALIDATION_FAILED);
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const validationResult = await ForecastService.parseAndValidateCsvFile(csvContent);

      if (validationResult.errors.length > 0) {
        const response = ResponseUtil.success('CSV file contains validation errors', validationResult);
        res.status(200).json(response);
        return;
      }

      const result = await ForecastService.bulkCreateFromCsv(validationResult.forecasts);
      const forecastDto = toDtoList(ForecastResponseDto, result.forecasts);
      const responseData = {
        created: result.created,
        forecasts: forecastDto,
      };
      const response = ResponseUtil.success(INFO_MESSAGES.FORECAST.IMPORTED_SUCCESSFULLY, responseData);
      res.status(201).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'uploadCsvFile' });
    }
  }

}
