import { Expose, Type } from "class-transformer";
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';
import { ForecastType, ForecastStatus, ForecastCategory } from '../constants/forecast.constants';

/**
 * Response DTO for Forecast entity
 */
export class ForecastResponseDto extends BaseDto {
    @Expose()
    date!: Date;

    @Expose()
    type!: ForecastType;

    @Expose()
    category!: ForecastCategory;

    @Expose()
    description!: string;

    @Expose()
    amount!: number;

    @Expose()
    currency!: string;

    @Expose()
    amountUSD!: number;

    @Expose()
    bankAccount!: string;

    @Expose()
    status!: ForecastStatus;
}

/**
 * Response DTO for paginated forecast list
 */
export class GetAllForecastResponseDto {
    @Expose()
    @Type(() => ForecastResponseDto)
    forecasts!: ForecastResponseDto[];

    @Expose()
    pagination!: PaginationResult<any>['pagination'];

    @Expose()
    filters?: PaginationResult<any>['filters'];
}

/**
 * DTO for forecast statistics/summary
 */
export class ForecastSummaryDto {
    @Expose()
    totalInflows!: number;

    @Expose()
    totalOutflows!: number;

    @Expose()
    netAmount!: number;

    @Expose()
    currency!: string;

    @Expose()
    currentCashBalance?: number;

    @Expose()
    projectedMonthEndCash?: number;
}
