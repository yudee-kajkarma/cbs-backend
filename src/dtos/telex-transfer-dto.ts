import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../interfaces/pagination.interface';
import { TelexTransferStatus } from '../constants/telex-transfer.constants';
import { Currency } from '../constants/common.constants';

/**
 * Response DTO for BankAccount reference (simplified)
 */
export class BankAccountRefDto {
  @Expose()
  _id!: string;

  @Expose()
  bankName!: string;

  @Expose()
  accountNumber!: string;

  @Expose()
  accountHolder!: string;
}

/**
 * Response DTO for Telex Transfer entity
 */
export class TelexTransferResponseDto extends BaseDto {
  @Expose()
  referenceNo!: string;

  @Expose()
  transferDate!: Date;

  @Expose()
  @Type(() => BankAccountRefDto)
  senderBank!: BankAccountRefDto;

  @Expose()
  senderAccountNo!: string;

  @Expose()
  beneficiaryName!: string;

  @Expose()
  beneficiaryBankName!: string;

  @Expose()
  beneficiaryAccountNo!: string;

  @Expose()
  swiftCode!: string;

  @Expose()
  transferAmount!: number;

  @Expose()
  currency!: Currency;

  @Expose()
  purpose!: string;

  @Expose()
  remarks?: string;

  @Expose()
  authorizedBy!: string;

  @Expose()
  status!: TelexTransferStatus;
}

/**
 * Response DTO for paginated telex transfer list
 */
export class GetAllTelexTransfersResponseDto {
  @Expose()
  @Type(() => TelexTransferResponseDto)
  telexTransfers!: TelexTransferResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters!: PaginationResult<any>['filters'];
}
