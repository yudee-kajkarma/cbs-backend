import { Schema, model, Document } from "mongoose";
import { TransferType, HardwareCondition, HardwareList, TransferUserList, TransferStatus } from "../constants";
import { IHardwareTransfer } from '../interfaces';

const schema = new Schema(
  {
    hardwareName: { type: String, enum: Object.values(HardwareList), required: true },
    serialNumber: { type: String, required: true },

    fromUser: { type: String, enum: Object.values(TransferUserList), required: true },
    toUser: { type: String, enum: Object.values(TransferUserList), required: true },

    transferDate: { type: Date, required: true },
    expectedReturnDate: { type: Date, default: null },

    transferType: { type: String, enum: Object.values(TransferType), required: true },
    hardwareCondition: { type: String, enum: Object.values(HardwareCondition), required: true },

    transferReason: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },

    status: { type: String, enum: Object.values(TransferStatus), default: TransferStatus.ACTIVE },
  },
  {
    timestamps: true,
    versionKey: false, 
  }
);

export const HardwareTransferModel = model<IHardwareTransfer>(
  "HardwareTransfer",
  schema
);
