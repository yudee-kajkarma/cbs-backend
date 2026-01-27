import { Schema } from "mongoose";
import { Currency, allowedCurrencies } from "../constants/common.constants";
import { BankBalanceStatus, allowedBankBalanceStatuses, allowedAccountTypes } from "../constants/daily-bank-balance.constants";
import { BankAccountDocument } from "../interfaces/model.interface";

export const bankAccountSchema = new Schema<BankAccountDocument>(
    {
        bankName: {
            type: String,
            required: [true, 'Bank name is required'],
            trim: true,
            maxlength: [100, 'Bank name cannot exceed 100 characters'],
        },
        branch: {
            type: String,
            trim: true,
            maxlength: [100, 'Branch cannot exceed 100 characters'],
        },
        accountHolder: {
            type: String,
            required: [true, 'Account holder name is required'],
            trim: true,
            maxlength: [100, 'Account holder name cannot exceed 100 characters'],
        },
        accountNumber: {
            type: String,
            required: [true, 'Account number is required'],
            trim: true,
            maxlength: [50, 'Account number cannot exceed 50 characters'],
        },
        currency: {
            type: String,
            enum: {
                values: allowedCurrencies,
                message: '{VALUE} is not a valid currency'
            },
            default: Currency.KWD,
        },
        currentChequeNumber: {
            type: String,
            trim: true,
            unique: true,
            maxlength: [50, 'Current cheque number cannot exceed 50 characters'],
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Address cannot exceed 200 characters'],
        },
        fileKey: {
            type: String,
            trim: true,
            maxlength: [500, 'File key cannot exceed 500 characters'],
        },
        type: {
            type: String,
            enum: {
                values: allowedAccountTypes,
                message: '{VALUE} is not a valid account type',
            },
            default: 'Current',
        },
        currentBalance: {
            type: Number,
            default: 0,
        },
        displayCurrency: {
            type: String,
            trim: true,
            default: 'KWD',
        },
        status: {
            type: String,
            enum: {
                values: allowedBankBalanceStatuses,
                message: '{VALUE} is not a valid status',
            },
            default: BankBalanceStatus.ACTIVE,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for better query performance
bankAccountSchema.index({ bankName: 1 }, { name: 'idx_bank_account_bank_name' });
bankAccountSchema.index({ accountNumber: 1 }, { name: 'idx_bank_account_number', unique: true });
bankAccountSchema.index({ currency: 1 }, { name: 'idx_bank_account_currency' });
bankAccountSchema.index({ type: 1 }, { name: 'idx_bank_account_type' });
bankAccountSchema.index({ status: 1 }, { name: 'idx_bank_account_status' });
bankAccountSchema.index({ createdAt: -1 }, { name: 'idx_bank_account_created_desc' });
bankAccountSchema.index({ updatedAt: -1 }, { name: 'idx_bank_account_updated_desc' });




// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
