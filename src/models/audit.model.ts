import { Schema, model } from "mongoose";

export const allowedAuditTypes = [
  "Financial Audit",
  "Internal Audit",
  "Compliance Audit",
  "Tax Audit",
  "Operational Audit",
];

const auditSchema = new Schema(
  {
    name: { type: String, required: true },

    type: {
      type: String,
      required: true,
      enum: allowedAuditTypes, // only these allowed
    },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    auditor: { type: String, required: true },

    completionDate: { type: Date, required: true },

    fileKey: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false, //  ❌ removes "__v"
  }
);

export default model("Audit", auditSchema);
