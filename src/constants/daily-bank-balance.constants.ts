/**
 * Bank Balance Status Constants
 */
export enum BankBalanceStatus {
    ACTIVE = 'Active',
    CLOSED = 'Closed',
    FROZEN = 'Frozen',
}

export const allowedBankBalanceStatuses = Object.values(BankBalanceStatus);

/**
 * Account Type Constants
 */
export enum AccountType {
    CURRENT = 'Current',
    SAVINGS = 'Savings',
    FIXED_DEPOSIT = 'Fixed Deposit',
    BUSINESS = 'Business',
}

export const allowedAccountTypes = Object.values(AccountType);
