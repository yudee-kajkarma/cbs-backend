import { Schema, model } from "mongoose";
import { allowedDocumentCategories } from "../dto/document.dto";

const documentSchema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: allowedDocumentCategories,
      required: true,
    },
    documentDate: { type: Date, required: true },
    partiesInvolved: { type: String, required: true },
    // internal S3 key (backend-only)
    fileKey: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default model("Document", documentSchema);
