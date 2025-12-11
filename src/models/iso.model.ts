import { Schema, model, Document } from "mongoose";

export interface ISO extends Document {
  certificateName: string;
  isoStandard: string;
  issueDate: Date;
  expiryDate: Date;
  certifyingBody: string;
  fileKey: string;
}

const allowedStandards = [
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 27001:2013",
  "ISO 45001:2018",
  "ISO 50001:2018"
];
const ISOSchema = new Schema<ISO>(
  {
    certificateName: { type: String, required: true },

    isoStandard: {
      type: String,
      required: true,
      enum: allowedStandards
    },

    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    certifyingBody: { type: String, required: true },

    fileKey: { type: String, required: true }
  },
  { 
    timestamps: true,
    versionKey: false   // <-- REMOVE __v COMPLETELY 
  }
);


export const ISOModel = model<ISO>("ISO", ISOSchema);
export { allowedStandards };
