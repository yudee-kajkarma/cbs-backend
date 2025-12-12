/**
 * Calculate audit status based on dates
 */
export function calculateAuditStatus(
  periodStart: Date,
  periodEnd: Date,
  completionDate: Date
): string {
  const now = new Date();
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const completion = new Date(completionDate);

  if (now > completion) return "Completed";
  if (now >= start && now <= end) return "In Progress";
  return "Scheduled";
}

/**
 * Calculate license/ISO/certificate status based on expiry date
 */
export function calculateExpiryStatus(expiryDate: Date): string {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return "Expired";
  if (diffDays <= 30) return "Expiring Soon";
  return "Active";
}

/**
 * Calculate hardware transfer status based on dates and type
 */
export function calculateTransferStatus(
  transferDate: Date,
  expectedReturnDate: Date | null,
  transferType: string
): string {
  const now = new Date();
  const transfer = new Date(transferDate);

  if (transferType === "Permanent") {
    return now >= transfer ? "Completed" : "Pending";
  }

  if (!expectedReturnDate) {
    return now >= transfer ? "Active" : "Pending";
  }

  const returnDate = new Date(expectedReturnDate);
  if (now < transfer) return "Pending";
  if (now > returnDate) return "Overdue";
  return "Active";
}
