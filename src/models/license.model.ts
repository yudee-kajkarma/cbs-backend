import { Schema } from "mongoose";
import { ILicense } from '../interfaces/model.interface';

export const licenseSchema = new Schema<ILicense>(
  {
    name: { 
      type: String, 
      required: [true, 'License name is required'],
      trim: true,
      maxlength: [200, 'License name cannot exceed 200 characters']
    },
    number: { 
      type: String, 
      required: [true, 'License number is required'], 
      unique: true,
      trim: true,
      maxlength: [100, 'License number cannot exceed 100 characters']
    },
    issueDate: { 
      type: Date, 
      required: [true, 'Issue date is required']
    },
    expiryDate: { 
      type: Date, 
      required: [true, 'Expiry date is required'],
      validate: {
        validator: function(this: ILicense, value: Date) {
          return !this.issueDate || value >= this.issueDate;
        },
        message: 'Expiry date must be after issue date'
      }
    },
    issuingAuthority: { 
      type: String, 
      required: [true, 'Issuing authority is required'],
      trim: true,
      maxlength: [200, 'Issuing authority cannot exceed 200 characters']
    },
    fileKey: { 
      type: String,
      trim: true,
      maxlength: [500, 'File key cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
licenseSchema.index({ number: 1 }, { name: 'idx_license_number', unique: true });
licenseSchema.index({ expiryDate: 1 }, { name: 'idx_license_expiry' });
licenseSchema.index({ name: 1 }, { name: 'idx_license_name' });
licenseSchema.index({ issuingAuthority: 1 }, { name: 'idx_license_authority' });
licenseSchema.index({ createdAt: -1 }, { name: 'idx_license_created_desc' });

// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
