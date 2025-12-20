/**
 * Cheque Module Constants
 */

/**
 * Cheque Print Status
 */
export enum ChequePrintStatus {
  PRINTED = "Printed",
  PENDING = "Pending",
  CANCELLED = "Cancelled",
}

/**
 * Cheque Transaction Status
 */
export enum ChequeTransactionStatus {
  HANDED_OVER = "Handed Over",
  CREDITED = "Credited",
  DEBITED = "Debited",
  PENDING = "Pending",
  NOT_SET = "Not Set",
}

/**
 * Cheque Orientation
 */
export enum ChequeOrientation {
  HORIZONTAL = "Horizontal",
  VERTICAL = "Vertical",
}

export const allowedChequePrintStatuses = Object.values(ChequePrintStatus);
export const allowedChequeTransactionStatuses = Object.values(ChequeTransactionStatus);
export const allowedChequeOrientations = Object.values(ChequeOrientation);
