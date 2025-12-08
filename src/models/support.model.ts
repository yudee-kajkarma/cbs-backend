import { Schema, model, Document } from "mongoose";

export interface ISupport extends Document {
  ticketTitle: string;
  category: string;
  priority: string;
  department: string;
  assignTo: string;
  description: string;
  submittedBy: string;       // NEW
  status: string;            // NEW
  createdAt: Date;
  updatedAt: Date;
}

const SupportSchema = new Schema<ISupport>(
  {
    ticketTitle: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "Hardware",
        "Software",
        "Network",
        "Email",
        "Access Control",
        "Printer",
        "Phone",
        "Other",
      ],
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },

    department: {
      type: String,
      enum: ["Finance", "HR", "Operations", "Sales", "Marketing", "IT", "Legal"],
      required: true,
    },

    assignTo: {
      type: String,
      enum: ["Unassigned", "Mark Wilson", "James Chen", "Sarah Mitchell"],
      required: true,
    },

    description: { type: String, required: true },

    submittedBy: { type: String, required: true },  // NEW

    status: {
      type: String,
      enum: ["Open", "InProgress", "Resolved"],     // NEW
      default: "Open",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { transform(doc, ret) { delete ret.__v; return ret; } },
    toObject: { transform(doc, ret) { delete ret.__v; return ret; } },
  }
);

export const SupportModel = model<ISupport>("Support", SupportSchema);
