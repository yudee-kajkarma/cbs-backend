import { Schema, model, Document } from "mongoose";
import { ISoftware } from '../interfaces';

export type { ISoftware };

const SoftwareSchema = new Schema<ISoftware>(
  {
    name: { type: String, required: true, trim: true },

    // vendor MUST be provided
    vendor: { type: String, required: true, trim: true },

    licenseType: { type: String, required: true },
    licenseKey: { type: String, required: true, trim: true, unique: true },

    // seats MUST be provided
    totalSeats: { type: Number, required: true },
    seatsUsed: { type: Number, required: true },

    purchaseDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    renewalCost: { type: String, required: true },

    assignedDepartment: { type: String, required: true },

    status: { type: String, required: true }
  },
  { timestamps: true }
);

SoftwareSchema.set("toJSON", {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

SoftwareSchema.set("toObject", {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export const SoftwareModel = model<ISoftware>("Software", SoftwareSchema);
