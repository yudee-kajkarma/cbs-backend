import { Expose, Type } from "class-transformer";
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';
import { ChequePrintStatus, ChequeTransactionStatus, ChequeOrientation } from '../constants/cheque.constants';

/**
 * Nested DTO for Bank Account in Cheque response
 */
export class ChequeBankAccountDto {
    @Expose({ name: '_id' })
    id!: string;

    @Expose()
    bankName!: string;

    @Expose()
    branch?: string;

    @Expose()
    accountNumber!: string;

    @Expose()
    currentChequeNumber?: string;

    @Expose()
    currency?: string;
}

/**
 * Response DTO for Cheque entity
 */
export class ChequeResponseDto extends BaseDto {
    @Expose()
    bankAccount!: string;

    @Expose()
    chequeNumber!: string;

    @Expose()
    payeeName!: string;

    @Expose()
    amount!: number;

    @Expose()
    chequeDate!: Date;

    @Expose()
    orientation!: ChequeOrientation;

    @Expose()
    printStatus!: ChequePrintStatus;

    @Expose()
    transactionStatus!: ChequeTransactionStatus;
}

/**
 * Response DTO for Cheque with populated bank account details
 */
export class ChequeWithBankResponseDto extends BaseDto {
    @Expose()
    @Type(() => ChequeBankAccountDto)
    bankAccount!: ChequeBankAccountDto;

    @Expose()
    chequeNumber!: string;

    @Expose()
    payeeName!: string;

    @Expose()
    amount!: number;

    @Expose()
    chequeDate!: Date;

    @Expose()
    orientation!: ChequeOrientation;

    @Expose()
    printStatus!: ChequePrintStatus;

    @Expose()
    transactionStatus!: ChequeTransactionStatus;
}

/**
 * Response DTO for paginated cheque list
 */
export class GetAllChequeResponseDto {
    @Expose()
    @Type(() => ChequeWithBankResponseDto)
    cheques!: ChequeWithBankResponseDto[];

    @Expose()
    pagination!: PaginationResult<any>['pagination'];

    @Expose()
    filters?: PaginationResult<any>['filters'];
}
