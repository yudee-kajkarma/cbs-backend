export const DEFAULT_PAYROLL_SETTINGS = {
    SOCIAL_INSURANCE_RATE: 10,
    PAYROLL_PROCESSING_DAY: 25, 
    ATTENDANCE_BONUS_AMOUNT: 50, 
    DEFAULT_CURRENCY: 'KWD',
    DEFAULT_PAYMENT_METHOD: 'Bank Transfer',
};

export enum PaymentMethod {
    BANK_TRANSFER = "Bank Transfer",
    CASH = "Cash",
    CHEQUE = "Cheque"
}

export const allowedPaymentMethods = Object.values(PaymentMethod);
