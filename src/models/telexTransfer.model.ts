import mongoose, { Document, Schema } from "mongoose";
import { allowedTelexTransferStatuses, TelexTransferStatus, allowedAuthorizedPersons } from "../constants/telex-transfer.constants";
import { allowedCurrencies, Currency } from "../constants/common.constants";

export interface TelexTransferDocument extends Document {
  referenceNo: string;
  transferDate: Date;
  senderBank: mongoose.Types.ObjectId;
  senderAccountNo: string;
  beneficiaryName: string;
  beneficiaryBankName: string;
  beneficiaryAccountNo: string;
  swiftCode: string;
  transferAmount: number;
  currency: Currency;
  purpose: string;
  remarks?: string;
  authorizedBy: string;
  status: TelexTransferStatus;
  createdAt: Date;
  updatedAt: Date;
}

const telexTransferSchema = new Schema<TelexTransferDocument>(
  {
    referenceNo: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [50, 'Reference number cannot exceed 50 characters'],
    },
    transferDate: {
      type: Date,
      required: [true, 'Transfer date is required'],
    },
    senderBank: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: [true, 'Sender bank is required'],
    },
    senderAccountNo: {
      type: String,
      required: [true, 'Sender account number is required'],
      trim: true,
      maxlength: [50, 'Sender account number cannot exceed 50 characters'],
    },
    beneficiaryName: {
      type: String,
      required: [true, 'Beneficiary name is required'],
      trim: true,
      maxlength: [200, 'Beneficiary name cannot exceed 200 characters'],
    },
    beneficiaryBankName: {
      type: String,
      required: [true, 'Beneficiary bank name is required'],
      trim: true,
      maxlength: [200, 'Beneficiary bank name cannot exceed 200 characters'],
    },
    beneficiaryAccountNo: {
      type: String,
      required: [true, 'Beneficiary account number is required'],
      trim: true,
      maxlength: [50, 'Beneficiary account number cannot exceed 50 characters'],
    },
    swiftCode: {
      type: String,
      required: [true, 'SWIFT/IBAN code is required'],
      trim: true,
      maxlength: [50, 'SWIFT/IBAN code cannot exceed 50 characters'],
    },
    transferAmount: {
      type: Number,
      required: [true, 'Transfer amount is required'],
      min: [0, 'Transfer amount must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: {
        values: allowedCurrencies,
        message: '{VALUE} is not a valid currency',
      },
      default: Currency.USD,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [500, 'Purpose cannot exceed 500 characters'],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
    authorizedBy: {
      type: String,
      required: [true, 'Authorized by is required'],
      enum: {
        values: allowedAuthorizedPersons,
        message: '{VALUE} is not a valid authorized person',
      },
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: allowedTelexTransferStatuses,
        message: '{VALUE} is not a valid status',
      },
      default: TelexTransferStatus.DRAFT,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook to auto-generate reference number
telexTransferSchema.pre('save', async function(next) {
  if (!this.referenceNo) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const lastTransfer: any = await mongoose.model('TelexTransfer')
      .findOne({
        referenceNo: new RegExp(`^TT-${year}-${month}-`)
      })
      .sort({ referenceNo: -1 })
      .lean();
    
    let sequence = 1;
    if (lastTransfer && lastTransfer.referenceNo) {
      const lastSequence = parseInt(lastTransfer.referenceNo.split('-')[3]);
      sequence = lastSequence + 1;
    }
    
    this.referenceNo = `TT-${year}-${month}-${String(sequence).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better query performance
telexTransferSchema.index({ referenceNo: 1 }, { name: 'idx_telex_reference_no', unique: true });
telexTransferSchema.index({ createdAt: -1 }, { name: 'idx_telex_created_desc' });

export default mongoose.model<TelexTransferDocument>("TelexTransfer", telexTransferSchema);
