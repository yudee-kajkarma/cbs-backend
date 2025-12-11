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
    number: { type: String, required: true },
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


export default mongoose.model<ILicense>("License", LicenseSchema);
