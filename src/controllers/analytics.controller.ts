import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { ResponseUtil } from "../utils/response-formatter.util";
import { ErrorHandler } from "../utils/error-handler.util";
import { INFO_MESSAGES } from "../constants/info-messages.constants";
import { 
  ITOverviewResponseDto,
  AssetsOverviewResponseDto,
  CompanyDocsOverviewResponseDto,
  BankOverviewResponseDto
} from "../dtos/analytics-dto";
import { toDto } from "../utils/dto-mapper.util";

/**
 * Analytics Controller
 * Handles IT module analytics endpoints
 */
export class AnalyticsController {

  /**
   * Get IT module overview analytics
   * @route GET /api/it-analytics/overview
   */
  static async getITOverview(req: Request, res: Response): Promise<void> {
    try {
      const result = await AnalyticsService.getITOverview();
      const dto = toDto(ITOverviewResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ANALYTICS.IT_OVERVIEW_RETRIEVED_SUCCESSFULLY,
        dto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { 
        method: 'getITOverview'
      });
    }
  }

  /**
   * Get Assets module overview analytics
   * @route GET /api/assets-analytics/overview
   */
  static async getAssetsOverview(req: Request, res: Response): Promise<void> {
    try {
      const result = await AnalyticsService.getAssetsOverview();
      const dto = toDto(AssetsOverviewResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ANALYTICS.ASSETS_OVERVIEW_RETRIEVED_SUCCESSFULLY,
        dto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { 
        method: 'getAssetsOverview'
      });
    }
  }

  /**
   * Get Company Documents module overview analytics
   * @route GET /api/it-analytics/company-docs-overview
   */
  static async getCompanyDocsOverview(req: Request, res: Response): Promise<void> {
    try {
      const result = await AnalyticsService.getCompanyDocsOverview();
      const dto = toDto(CompanyDocsOverviewResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ANALYTICS.COMPANY_DOCS_OVERVIEW_RETRIEVED_SUCCESSFULLY,
        dto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { 
        method: 'getCompanyDocsOverview'
      });
    }
  }

  /**
   * Get Bank module overview analytics
   * @route GET /api/it-analytics/bank-overview
   */
  static async getBankOverview(req: Request, res: Response): Promise<void> {
    try {
      const result = await AnalyticsService.getBankOverview();
      const dto = toDto(BankOverviewResponseDto, result);
      const response = ResponseUtil.success(
        INFO_MESSAGES.ANALYTICS.BANK_OVERVIEW_RETRIEVED_SUCCESSFULLY,
        dto
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { 
        method: 'getBankOverview'
      });
    }
  }
}
