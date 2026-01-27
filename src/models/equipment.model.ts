import { Schema } from "mongoose";
import { EquipmentCategory, EquipmentCondition, GeneralEquipmentStatus } from "../constants/equipment.constants";
import { Currency } from "../constants/common.constants";
import { Equipment, EquipmentDocument } from '../interfaces';

export const EquipmentSchema = new Schema<EquipmentDocument>(
  {
    equipmentName: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      maxlength: [200, 'Equipment name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: {
        values: Object.values(EquipmentCategory),
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    manufacturer: {
      type: String,
      trim: true,
      maxlength: [100, 'Manufacturer cannot exceed 100 characters'],
    },
    equipmentModel: {
      type: String,
      trim: true,
      maxlength: [100, 'Model cannot exceed 100 characters'],
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters'],
    },
    condition: {
      type: String,
      enum: {
        values: Object.values(EquipmentCondition),
        message: '{VALUE} is not a valid condition',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [100, 'Assigned to cannot exceed 100 characters'],
    },
    purchaseDate: {
      type: Date,
    },
    purchaseValue: {
      type: Number,
      min: [0, 'Purchase value cannot be negative'],
    },
    purchaseCurrency: {
      type: String,
      enum: {
        values: Object.values(Currency),
        message: '{VALUE} is not a valid currency',
      },
    },
    currentValue: {
      type: Number,
      min: [0, 'Current value cannot be negative'],
    },
    currentCurrency: {
      type: String,
      enum: {
        values: Object.values(Currency),
        message: '{VALUE} is not a valid currency',
      },
    },
    warrantyProvider: {
      type: String,
      trim: true,
      maxlength: [100, 'Warranty provider cannot exceed 100 characters'],
    },
    warrantyExpiry: {
      type: Date,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    maintenanceContract: {
      type: String,
      trim: true,
      maxlength: [200, 'Maintenance contract cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(GeneralEquipmentStatus),
        message: '{VALUE} is not a valid status',
      },
      default: GeneralEquipmentStatus.ACTIVE,
    },
    technicalSpecifications: {
      type: String,
      maxlength: [2000, 'Technical specifications cannot exceed 2000 characters'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
EquipmentSchema.index({ equipmentName: 1 });
EquipmentSchema.index({ serialNumber: 1 });
EquipmentSchema.index({ category: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ location: 1 });

// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
