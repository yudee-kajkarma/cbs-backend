import { Schema, model } from "mongoose";
import { TransferType, HardwareCondition, HardwareList, TransferUserList, TransferStatus } from "../constants";
import { IHardwareTransfer } from '../interfaces';

export const hardwareTransferSchema = new Schema<IHardwareTransfer>(
  {
    hardwareName: { 
      type: String, 
      enum: {
        values: Object.values(HardwareList),
        message: '{VALUE} is not a valid hardware name'
      },
      required: [true, 'Hardware name is required']
    },
    serialNumber: { 
      type: String, 
      required: [true, 'Serial number is required'],
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters']
    },
    fromUser: { 
      type: String, 
      enum: {
        values: Object.values(TransferUserList),
        message: '{VALUE} is not a valid user'
      },
      required: [true, 'From user is required']
    },
    toUser: { 
      type: String, 
      enum: {
        values: Object.values(TransferUserList),
        message: '{VALUE} is not a valid user'
      },
      required: [true, 'To user is required']
    },
    transferDate: { 
      type: Date, 
      required: [true, 'Transfer date is required']
    },
    expectedReturnDate: { 
      type: Date
    },
    transferType: { 
      type: String, 
      enum: {
        values: Object.values(TransferType),
        message: '{VALUE} is not a valid transfer type'
      },
      required: [true, 'Transfer type is required']
    },
    hardwareCondition: { 
      type: String, 
      enum: {
        values: Object.values(HardwareCondition),
        message: '{VALUE} is not a valid hardware condition'
      },
      required: [true, 'Hardware condition is required']
    },
    transferReason: { 
      type: String,
      trim: true
    },
    approvedBy: { 
      type: String,
      trim: true
    },
    additionalNotes: { 
      type: String,
      trim: true
    },
    status: { 
      type: String, 
      enum: {
        values: Object.values(TransferStatus),
        message: '{VALUE} is not a valid status'
      },
      default: TransferStatus.ACTIVE
    },
  },
  {
    timestamps: true,
    versionKey: false, 
  }
);

// Indexes for better query performance
hardwareTransferSchema.index({ serialNumber: 1 }, { name: 'idx_hardware_transfer_serial' });
hardwareTransferSchema.index({ fromUser: 1 }, { name: 'idx_hardware_transfer_from_user' });
hardwareTransferSchema.index({ toUser: 1 }, { name: 'idx_hardware_transfer_to_user' });
hardwareTransferSchema.index({ transferDate: -1 }, { name: 'idx_hardware_transfer_date_desc' });
hardwareTransferSchema.index({ status: 1 }, { name: 'idx_hardware_transfer_status' });
hardwareTransferSchema.index({ createdAt: -1 }, { name: 'idx_hardware_transfer_created_desc' });


// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
