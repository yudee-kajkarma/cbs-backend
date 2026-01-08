import { Expose, Type } from "class-transformer";
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';
import { Currency } from '../constants/common.constants';

/**
 * Response DTO for BankAccount entity
 */
export class BankAccountResponseDto extends BaseDto {
    @Expose()
    bankName!: string;

    @Expose()
    branch!: string;

    @Expose()
    accountHolder!: string;

    @Expose()
    accountNumber!: string;

    @Expose()
    currency!: Currency;

    @Expose()
    currentChequeNumber?: string;

    @Expose()
    address?: string;
    
    @Expose()
    fileKey?: string;

    @Expose()
    fileUrl?: string;

    @Expose()
    type?: string;

    @Expose()
    currentBalance?: number;

    @Expose()
    displayCurrency?: string;

    @Expose()
    status?: string;

    // Currency conversion fields
    @Expose()
    currentBalanceInDisplay?: number;
}

/**
 * Response DTO for paginated bank account list
 */
export class GetAllBankAccountResponseDto {
    @Expose()
    @Type(() => BankAccountResponseDto)
    bankAccounts!: BankAccountResponseDto[];

    @Expose()
    pagination!: PaginationResult<any>['pagination'];

    @Expose()
    filters?: PaginationResult<any>['filters'];
}
