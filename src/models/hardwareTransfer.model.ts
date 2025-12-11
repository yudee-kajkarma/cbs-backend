import { Schema, model, Document } from "mongoose";

export enum TransferType {
  TEMPORARY = "Temporary",
  PERMANENT = "Permanent",
}

export enum HardwareCondition {
  EXCELLENT = "Excellent",
  GOOD = "Good",
  FAIR = "Fair",
  POOR = "Poor",
}

export enum HardwareList {
  DELL_LATITUDE_7420 = "Dell Latitude 7420 (Laptop)",
  HP_ELITEDESK_800_G6 = "HP EliteDesk 800 G6 (Desktop)",
  MACBOOK_PRO_16 = "MacBook Pro 16\" (Laptop)",
  LENOVO_THINKPAD_T14 = "Lenovo ThinkPad T14 (Laptop)",
  DELL_MONITOR_27 = "Dell Monitor 27\" (Monitor)",
  IPAD_PRO_12_9 = "iPad Pro 12.9\" (Tablet)",
  HP_LASER_PRINTER = "HP Laser Printer (Printer)",
  DELL_POWEREDGE_R740 = "Dell PowerEdge R740 (Server)",
}

export enum TransferUserList {
  JOHN_SMITH_FINANCE = "John Smith - Finance",
  SARAH_JOHNSON_MARKETING = "Sarah Johnson - Marketing",
  MICHAEL_BROWN_OPERATIONS = "Michael Brown - Operations",
  AHMED_AL_RASHID_FINANCE = "Ahmed Al-Rashid - Finance",
  EMMA_WILSON_DESIGN = "Emma Wilson - Design",
  DAVID_LEE_SALES = "David Lee - Sales",
  IT_DEPARTMENT_IT = "IT Department - IT",
  UNASSIGNED_IT = "Unassigned - IT",
}

export enum TransferStatus {
  ACTIVE = "Active",
  RETURNED = "Returned",
  PERMANENT = "Permanent",
}

export interface IHardwareTransfer extends Document {
  hardwareName: string;
  serialNumber: string;
  fromUser: string;
  toUser: string;
  transferDate: Date;
  expectedReturnDate?: Date | null;
  transferType: string;
  hardwareCondition: string;
  transferReason?: string;
  approvedBy?: string;
  additionalNotes?: string;
  status: string;
}

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
