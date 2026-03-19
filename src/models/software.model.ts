import { Schema, model } from "mongoose";
import { ISoftware } from '../interfaces/model.interface';
import { LicenseType, SoftwareStatus, allowedLicenseTypes, allowedSoftwareStatuses } from '../constants/software.constants';
import { Department, allowedDepartments } from '../constants/common.constants';

const softwareCredentialSchema = new Schema(
  {
    username: { type: String, trim: true, default: '' },
    password: { type: String, default: '' },
  },
  { _id: false }
);

export const softwareSchema = new Schema<ISoftware>(
  {
    name: {
      type: String, 
      required: [true, 'Software name is required'], 
      trim: true,
      maxlength: [200, 'Software name cannot exceed 200 characters']
    },
    vendor: { 
      type: String, 
      required: [true, 'Vendor is required'], 
      trim: true,
      maxlength: [200, 'Vendor name cannot exceed 200 characters']
    },
    licenseType: { 
      type: String,
      enum: {
        values: allowedLicenseTypes,
        message: '{VALUE} is not a valid license type'
      },
      required: [true, 'License type is required']
    },
    licenseKey: { 
      type: String, 
      required: [true, 'License key is required'], 
      trim: true, 
      unique: true,
      maxlength: [500, 'License key cannot exceed 500 characters']
    },
    totalSeats: { 
      type: Number, 
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1']
    },
    seatsUsed: { 
      type: Number, 
      required: [true, 'Seats used is required'],
      min: [0, 'Seats used cannot be negative'],
      validate: {
        validator: function(this: ISoftware, value: number) {
          return this.totalSeats === undefined || value <= this.totalSeats;
        },
        message: 'Seats used cannot exceed total seats'
      }
    },
    purchaseDate: { 
      type: Date, 
      required: [true, 'Purchase date is required']
    },
    expiryDate: { 
      type: Date, 
      required: [true, 'Expiry date is required'],
      validate: {
        validator: function(this: ISoftware, value: Date) {
          return !this.purchaseDate || value >= this.purchaseDate;
        },
        message: 'Expiry date must be after purchase date'
      }
    },
    renewalCost: { 
      type: String, 
      required: [true, 'Renewal cost is required'],
      trim: true
    },
    assignedDepartment: { 
      type: String,
      enum: {
        values: allowedDepartments,
        message: '{VALUE} is not a valid department'
      },
      required: [true, 'Assigned department is required']
    },
    status: {
      type: String,
      enum: {
        values: allowedSoftwareStatuses,
        message: '{VALUE} is not a valid status'
      },
      required: [true, 'Status is required'],
      default: SoftwareStatus.ACTIVE
    },
    credentials: {
      type: [softwareCredentialSchema],
      default: []
    }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
softwareSchema.index({ name: 1 }, { name: 'idx_software_name' });
softwareSchema.index({ vendor: 1 }, { name: 'idx_software_vendor' });
softwareSchema.index({ licenseKey: 1 }, { name: 'idx_software_license_key', unique: true });
softwareSchema.index({ licenseType: 1 }, { name: 'idx_software_license_type' });
softwareSchema.index({ assignedDepartment: 1 }, { name: 'idx_software_department' });
softwareSchema.index({ status: 1 }, { name: 'idx_software_status' });
softwareSchema.index({ expiryDate: 1 }, { name: 'idx_software_expiry' });
softwareSchema.index({ createdAt: -1 }, { name: 'idx_software_created_desc' });


// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
