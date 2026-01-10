import { Schema } from "mongoose";
import { allowedPayeeCategories } from "../constants/payee.constants";
import { PayeeDocument } from '../interfaces';

export const payeeSchema = new Schema<PayeeDocument>(
  {
    name: {
      type: String,
      required: [true, 'Payee name is required'],
      trim: true,
      maxlength: [200, 'Payee name cannot exceed 200 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: allowedPayeeCategories,
        message: '{VALUE} is not a valid payee category',
      },
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [50, 'Phone number cannot exceed 50 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      validate: {
        validator: function(v: string) {
          if (!v) return true; 
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
payeeSchema.index({ name: 1 });
payeeSchema.index({ category: 1 });
payeeSchema.index({ email: 1 });

// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
