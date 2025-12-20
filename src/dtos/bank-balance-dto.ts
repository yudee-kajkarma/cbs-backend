import { Expose, Type } from "class-transformer";
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';

/**
 * Response DTO for BankBalance entity
 */
export class BankBalanceResponseDto extends BaseDto {
    @Expose()
    account!: string;

    @Expose()
    bank!: string;

    @Expose()
    branch?: string;

    @Expose()
    type!: string;

    @Expose()
    currentBalance!: number;

    @Expose()
    currency!: string;

    @Expose()
    finalBalance?: number;

    @Expose()
    status!: string;

    @Expose()
    currentBalanceInDisplay?: number;

    @Expose()
    finalBalanceInDisplay?: number;

    @Expose()
    displayCurrency?: string;
}

/**
 * Response DTO for paginated bank balance list
 */
export class GetAllBankBalanceResponseDto {
    @Expose()
    @Type(() => BankBalanceResponseDto)
    bankBalances!: BankBalanceResponseDto[];

    @Expose()
    pagination!: PaginationResult<any>['pagination'];

    @Expose()
    filters?: PaginationResult<any>['filters'];
}

/**
 * Response DTO for bank balance summary
 */
export class BankBalanceSummaryDto {
    @Expose()
    totalBalanceAcrossAllAccounts!: number;

    @Expose()
    totalAccounts!: number;

    @Expose()
    totalCurrentBalanceInBase!: number;

    @Expose()
    totalFinalBalanceInBase!: number;

    @Expose()
    variance!: number;

    @Expose()
    activeAccounts!: number;

    @Expose()
    baseCurrency!: string;
}
