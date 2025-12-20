import mongoose, { Schema } from "mongoose";
import { BankBalanceStatus, AccountType, allowedBankBalanceStatuses, allowedAccountTypes } from "../constants/bank-balance.constants";
import { BankBalanceDocument } from "../interfaces/model.interface";

const bankBalanceSchema = new Schema<BankBalanceDocument>(
  {
    account: {
      type: String,
      required: [true, 'Account is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Account cannot exceed 100 characters'],
    },
    bank: {
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
    type: {
      type: String,
      enum: {
        values: allowedAccountTypes,
        message: '{VALUE} is not a valid account type',
      },
      required: [true, 'Account type is required'],
    },
    currentBalance: {
      type: Number,
      required: [true, 'Current balance is required'],
      default: 0,
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      trim: true,
      default: 'USD',
    },
    displayCurrency: {
      type: String,
      trim: true,
      default: 'KWD',
    },
    finalBalance: {
      type: Number,
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
bankBalanceSchema.index({ account: 1 }, { name: 'idx_bank_balance_account' });
bankBalanceSchema.index({ bank: 1 }, { name: 'idx_bank_balance_bank' });
bankBalanceSchema.index({ type: 1 }, { name: 'idx_bank_balance_type' });
bankBalanceSchema.index({ status: 1 }, { name: 'idx_bank_balance_status' });
bankBalanceSchema.index({ currency: 1 }, { name: 'idx_bank_balance_currency' });
bankBalanceSchema.index({ createdAt: -1 }, { name: 'idx_bank_balance_created_desc' });
bankBalanceSchema.index({ updatedAt: -1 }, { name: 'idx_bank_balance_updated_desc' });

export default mongoose.model<BankBalanceDocument>("BankBalance", bankBalanceSchema);
