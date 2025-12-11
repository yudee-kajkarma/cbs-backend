import { Schema, model, Document } from "mongoose";

export interface ISim extends Document {
  simNumber: string;
  phoneNumber?: string;
  carrier: "Zain Kuwait" | "Ooredoo Kuwait" | "STC Kuwait" | "Other";
  planType?: string;
  monthlyFee?: number;
  currency?: "KWD" | "USD" | "EUR" | "GBP" | "AED" | "SAR";
  extraCharges?: number;
  simCharges?: number;
  dataLimit?: string;
  activationDate?: Date | null;
  expiryDate?: Date | null;
  assignedTo?: string | null;
  department?: string;
  deviceImei?: string;
  status: "Active" | "Inactive" | "Suspended" | "Expired";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SimSchema = new Schema<ISim>(
  {
    simNumber: { type: String, required: true, trim: true, unique: true },
    phoneNumber: { type: String, trim: true, unique: true },   // UNIQUE ✔
    carrier: { type: String, required: true },
    planType: { type: String, trim: true },
    monthlyFee: { type: Number, default: 0 },
    currency: { type: String, default: "KWD" },
    extraCharges: { type: Number, default: 0 },
    simCharges: { type: Number, default: 0 },
    dataLimit: { type: String },
    activationDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    assignedTo: { type: String, default: null },
    department: { type: String },

    // IMEI UNIQUE ✔
    deviceImei: { type: String, unique: true },

    status: { type: String, required: true, default: "Active" },
    notes: { type: String }
  },
  { timestamps: true }
);

// Remove __v automatically
SimSchema.set("toJSON", {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

SimSchema.set("toObject", {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export const SimModel = model<ISim>("Sim", SimSchema);
