import { Schema } from "mongoose";
import { ISO } from '../interfaces';
import { allowedISOStandards } from "../constants";

export const ISOSchema = new Schema<ISO>(
  {
    certificateName: { type: String, required: true },

    isoStandard: {
      type: String,
      required: true,
      enum: allowedISOStandards
    },

    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    certifyingBody: { type: String, required: true },

    fileKey: { type: String, required: true }
  },
  { 
    timestamps: true,
    versionKey: false  
  }
);

