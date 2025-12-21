import mongoose, { Schema } from "mongoose";
import { 
  ChequePrintStatus, 
  ChequeTransactionStatus, 
  ChequeOrientation
} from "../constants/cheque.constants";
import { ChequeDocument } from "../interfaces/model.interface";

const chequeSchema = new Schema<ChequeDocument>(
  {
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: [true, 'Bank account is required'],
    },
    chequeNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Cheque number cannot exceed 50 characters'],
    },
    payeeName: {
      type: String,
      required: [true, 'Payee name is required'],
      trim: true,
      maxlength: [200, 'Payee name cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    chequeDate: {
      type: Date,
      required: [true, 'Cheque date is required'],
    },
    orientation: {
      type: String,
      enum: Object.values(ChequeOrientation),
      default: ChequeOrientation.HORIZONTAL,
    },
    printStatus: {
      type: String,
      enum: Object.values(ChequePrintStatus),
      default: ChequePrintStatus.PENDING,
    },
    transactionStatus: {
      type: String,
      enum: Object.values(ChequeTransactionStatus),
      default: ChequeTransactionStatus.NOT_SET,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
chequeSchema.index({  chequeNumber: 1 }, { unique: true });
chequeSchema.index({ chequeDate: -1 });

export default mongoose.model<ChequeDocument>("Cheque", chequeSchema, "cheque");