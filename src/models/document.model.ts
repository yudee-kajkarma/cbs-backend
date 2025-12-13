import { Schema, model } from "mongoose";
import { allowedDocumentCategories } from "../constants/document.constants";
import { IDocument } from "../interfaces/model.interface";

const documentSchema = new Schema<IDocument>(
  {
    name: { 
      type: String, 
      required: [true, 'Document name is required'],
      trim: true,
      maxlength: [200, 'Document name cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: {
        values: allowedDocumentCategories,
        message: '{VALUE} is not a valid document category'
      },
      required: [true, 'Document category is required'],
    },
    documentDate: { 
      type: Date, 
      required: [true, 'Document date is required']
    },
    partiesInvolved: { 
      type: String, 
      required: [true, 'Parties involved is required'],
      trim: true
    },
    fileKey: { 
      type: String,
      trim: true,
      maxlength: [500, 'File key cannot exceed 500 characters']
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
documentSchema.index({ name: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ documentDate: -1 });
documentSchema.index({ createdAt: -1 });
export default model<IDocument>("Document", documentSchema);
