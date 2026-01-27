import mongoose, { Schema, Document } from "mongoose";
import { HardwareType, OperatingSystem, RAM, Storage, Department, HardwareStatus } from "../constants";
import { NewHardwareDocument } from '../interfaces';

export const NewHardwareSchema = new Schema<NewHardwareDocument>(
  {
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
      maxlength: [200, 'Device name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: {
        values: Object.values(HardwareType),
        message: '{VALUE} is not a valid hardware type',
      },
      required: [true, 'Hardware type is required'],
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters'],
    },
    operatingSystem: {
      type: String,
      enum: {
        values: Object.values(OperatingSystem),
        message: '{VALUE} is not a valid operating system',
      },
      required: [true, 'Operating system is required'],
    },
    processor: {
      type: String,
      trim: true,
      maxlength: [200, 'Processor description cannot exceed 200 characters'],
    },
    ram: {
      type: String,
      enum: Object.values(RAM),
    },
    storage: {
      type: String,
      enum: Object.values(Storage),
    },
    purchaseDate: {
      type: Date,
    },
    warrantyExpiry: {
      type: Date,
      validate: {
        validator: function(this: NewHardwareDocument, value: Date) {
          return !this.purchaseDate || !value || value >= this.purchaseDate;
        },
        message: 'Warranty expiry must be after purchase date',
      },
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [100, 'Assigned to cannot exceed 100 characters'],
    },
    department: {
      type: String,
      enum: Object.values(Department),
    },
    status: {
      type: String,
      enum: Object.values(HardwareStatus),
      required: [true, 'Status is required'],
      default: HardwareStatus.ACTIVE,
    },
    submittedBy: {
      type: String,
      trim: true,
      maxlength: [100, 'Submitted by cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
NewHardwareSchema.index({ serialNumber: 1 }, { name: 'idx_hardware_serial_unique', unique: true });
NewHardwareSchema.index({ type: 1 }, { name: 'idx_hardware_type' });
NewHardwareSchema.index({ status: 1 }, { name: 'idx_hardware_status' });
NewHardwareSchema.index({ department: 1 }, { name: 'idx_hardware_department' });
NewHardwareSchema.index({ status: 1, createdAt: -1 }, { name: 'idx_hardware_status_created' });

// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
