import mongoose, { Schema, Document } from "mongoose";

export interface ILicense extends Document {
  name: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  documentKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LicenseSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    issuingAuthority: { type: String, required: true },
    documentKey: { type: String }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

LicenseSchema.index({ expiryDate: 1, createdAt: -1 });

LicenseSchema.index({ 
  name: 'text', 
  number: 'text', 
  issuingAuthority: 'text' 
});

LicenseSchema.index({ number: 1 });

LicenseSchema.index({ createdAt: -1 });

export default mongoose.model<ILicense>("License", LicenseSchema);
