import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsISO8601,
  IsMongoId,
  IsNumber,
  Min,
} from "class-validator";

import {
  TransferType,
  HardwareCondition,
  HardwareList,
  TransferUserList,
  TransferStatus,
} from "../models/hardwareTransfer.model";

/* ----------------------------------------------------
   CREATE DTO
---------------------------------------------------- */
export class CreateHardwareTransferDto {
  @IsIn(Object.values(HardwareList))
  hardwareName!: string;

  @IsString()
  @IsNotEmpty()
  serialNumber!: string;

  @IsIn(Object.values(TransferUserList))
  fromUser!: string;

  @IsIn(Object.values(TransferUserList))
  toUser!: string;

  @IsISO8601()
  transferDate!: string;

  @IsOptional()
  @IsISO8601()
  expectedReturnDate?: string;

  @IsIn(Object.values(TransferType))
  transferType!: string;

  @IsIn(Object.values(HardwareCondition))
  hardwareCondition!: string;

  @IsOptional()
  @IsString()
  transferReason?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  // ⭐ ADDED THIS (Fix for your error)
  @IsOptional()
  @IsIn(Object.values(TransferStatus))
  status?: string;
}

/* ----------------------------------------------------
   UPDATE DTO
---------------------------------------------------- */
export class UpdateHardwareTransferDto {
  @IsOptional()
  @IsIn(Object.values(HardwareList))
  hardwareName?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsIn(Object.values(TransferUserList))
  fromUser?: string;

  @IsOptional()
  @IsIn(Object.values(TransferUserList))
  toUser?: string;

  @IsOptional()
  @IsISO8601()
  transferDate?: string;

  @IsOptional()
  @IsISO8601()
  expectedReturnDate?: string;

  @IsOptional()
  @IsIn(Object.values(TransferType))
  transferType?: string;

  @IsOptional()
  @IsIn(Object.values(HardwareCondition))
  hardwareCondition?: string;

  @IsOptional()
  @IsString()
  transferReason?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsIn(Object.values(TransferStatus))
  status?: string;
}

/* ----------------------------------------------------
   PARAMS DTO (/:id)
---------------------------------------------------- */
export class HardwareTransferIdDto {
  @IsMongoId()
  id!: string;
}

/* ----------------------------------------------------
   QUERY DTO
---------------------------------------------------- */
export class HardwareTransferQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
