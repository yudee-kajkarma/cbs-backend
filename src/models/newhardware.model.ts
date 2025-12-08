import { Schema, model, Document } from "mongoose";

export type HardwareType = "Laptop" | "Desktop" | "Server" | "Tablet" | "Workstation";
export type OperatingSystem =
  | "Windows 11 Pro"
  | "Windows 10 Pro"
  | "macOS Sonoma"
  | "Ubuntu Server 22.04"
  | "Ubuntu Desktop 22.04"
  | "Linux (Other)";
export type RAMOption = "4GB" | "8GB" | "16GB" | "32GB" | "64GB" | "128GB";
export type StorageOption =
  | "128GB SSD"
  | "256GB SSD"
  | "512GB SSD"
  | "1TB SSD"
  | "2TB SSD"
  | "2TB RAID"
  | "4TB RAID";
export type DepartmentOption = "IT" | "Finance" | "HR" | "Operations" | "Sales" | "Marketing" | "Legal";
export type HardwareStatus = "Active" | "Inactive" | "Under Repair" | "Retired";

export interface INewHardware extends Document {
  deviceName: string;
  type: HardwareType;
  serialNumber: string;
  operatingSystem: OperatingSystem;
  processor?: string | null;
  ram?: RAMOption | null;
  storage?: StorageOption | null;
  purchaseDate?: Date | null;
  warrantyExpiry?: Date | null;
  assignedTo?: string | null;
  department?: DepartmentOption | null;
  status: HardwareStatus;
  submittedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const NewHardwareSchema = new Schema<INewHardware>(
  {
    deviceName: { type: String, required: true },
    type: {
      type: String,
      enum: ["Laptop", "Desktop", "Server", "Tablet", "Workstation"],
      required: true,
    },
    serialNumber: { type: String, required: true, unique: true },
    operatingSystem: {
      type: String,
      enum: [
        "Windows 11 Pro",
        "Windows 10 Pro",
        "macOS Sonoma",
        "Ubuntu Server 22.04",
        "Ubuntu Desktop 22.04",
        "Linux (Other)",
      ],
      required: true,
    },
    processor: { type: String, default: null },
    ram: {
      type: String,
      enum: ["4GB", "8GB", "16GB", "32GB", "64GB", "128GB"],
      default: null,
    },
    storage: {
      type: String,
      enum: [
        "128GB SSD",
        "256GB SSD",
        "512GB SSD",
        "1TB SSD",
        "2TB SSD",
        "2TB RAID",
        "4TB RAID",
      ],
      default: null,
    },
    purchaseDate: { type: Date, default: null },
    warrantyExpiry: { type: Date, default: null },
    assignedTo: { type: String, default: null },
    department: {
      type: String,
      enum: ["IT", "Finance", "HR", "Operations", "Sales", "Marketing", "Legal"],
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Under Repair", "Retired"],
      required: true,
      default: "Active",
    },
    submittedBy: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NewHardwareModel = model<INewHardware>("NewHardware", NewHardwareSchema);
