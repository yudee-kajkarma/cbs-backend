import { Schema, model, Document } from "mongoose";
import { ISim } from '../interfaces';

export type { ISim };

const SimSchema = new Schema<ISim>(
  {
    simNumber: { type: String, required: true, trim: true, unique: true },
    phoneNumber: { type: String, trim: true, unique: true, sparse: true },
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

    deviceImei: { type: String, unique: true, sparse: true },

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
