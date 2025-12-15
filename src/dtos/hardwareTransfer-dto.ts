import { Expose, Type } from 'class-transformer';
import { BaseDto } from './base-dto';
import { PaginationResult } from '../services/pagination.service';

export enum HardwareList {
  LAPTOP = 'Laptop',
  DESKTOP = 'Desktop',
  MONITOR = 'Monitor',
  KEYBOARD = 'Keyboard',
  MOUSE = 'Mouse',
  PRINTER = 'Printer',
  SCANNER = 'Scanner',
  HEADSET = 'Headset',
  WEBCAM = 'Webcam',
  DOCKING_STATION = 'Docking Station',
  EXTERNAL_HDD = 'External HDD',
  UPS = 'UPS',
  NETWORK_SWITCH = 'Network Switch',
  ROUTER = 'Router',
  OTHER = 'Other'
}

export enum TransferUserList {
  JOHN_DOE = 'John Doe',
  JANE_SMITH = 'Jane Smith',
  ALICE_JOHNSON = 'Alice Johnson',
  BOB_WILLIAMS = 'Bob Williams',
  CHARLIE_BROWN = 'Charlie Brown',
  DIANA_PRINCE = 'Diana Prince',
  ETHAN_HUNT = 'Ethan Hunt',
  FIONA_GALLAGHER = 'Fiona Gallagher',
  GEORGE_MICHAEL = 'George Michael',
  HANNAH_MONTANA = 'Hannah Montana',
  UNASSIGNED = 'Unassigned'
}

export enum TransferType {
  PERMANENT = 'Permanent',
  TEMPORARY = 'Temporary',
  LOAN = 'Loan'
}

export enum HardwareCondition {
  NEW = 'New',
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  DAMAGED = 'Damaged'
}

export enum TransferStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

/**
 * Response DTO for Hardware Transfer entity
 */
export class HardwareTransferResponseDto extends BaseDto {
  @Expose()
  hardwareName!: HardwareList;

  @Expose()
  serialNumber!: string;

  @Expose()
  fromUser!: TransferUserList;

  @Expose()
  toUser!: TransferUserList;

  @Expose()
  transferDate!: Date;

  @Expose()
  expectedReturnDate?: Date | null;

  @Expose()
  transferType!: TransferType;

  @Expose()
  hardwareCondition!: HardwareCondition;

  @Expose()
  transferReason?: string;

  @Expose()
  approvedBy?: string;

  @Expose()
  additionalNotes?: string;

  @Expose()
  status?: TransferStatus;
}

/**
 * Response DTO for paginated hardware transfers list
 */
export class GetAllHardwareTransfersResponseDto {
  @Expose()
  @Type(() => HardwareTransferResponseDto)
  hardwareTransfers!: HardwareTransferResponseDto[];

  @Expose()
  pagination!: PaginationResult<any>['pagination'];

  @Expose()
  filters?: PaginationResult<any>['filters'];
}
