import mongoose, { Schema } from "mongoose";
import { FurnitureCategory, FurnitureCondition, Currency, FurnitureStatus } from "../constants";
import { FurnitureDocument } from '../interfaces';

const FurnitureSchema = new Schema<FurnitureDocument>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Item name cannot exceed 200 characters'],
    },
    itemCode: {
      type: String,
      required: [true, 'Item code is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Item code cannot exceed 50 characters'],
    },
    category: {
      type: String,
      enum: {
        values: Object.values(FurnitureCategory),
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [0, 'Quantity cannot be negative'],
    },
    condition: {
      type: String,
      enum: Object.values(FurnitureCondition),
      default: FurnitureCondition.GOOD,
    },
    material: {
      type: String,
      trim: true,
      maxlength: [100, 'Material description cannot exceed 100 characters'],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, 'Color cannot exceed 50 characters'],
    },
    dimensions: {
      type: String,
      trim: true,
      maxlength: [100, 'Dimensions cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    assignedTo: {
      type: String,
      default: "Unassigned",
      trim: true,
      maxlength: [100, 'Assigned to cannot exceed 100 characters'],
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [200, 'Supplier name cannot exceed 200 characters'],
    },
    purchaseDate: {
      type: Date,
    },
    unitValue: {
      type: Number,
      min: [0, 'Unit value cannot be negative'],
    },
    purchaseCurrency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.KWD,
    },
    currentUnitValue: {
      type: Number,
      min: [0, 'Current unit value cannot be negative'],
    },
    currentCurrency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.KWD,
    },
    warrantyExpiry: {
      type: Date,
    },
    maintenanceSchedule: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(FurnitureStatus),
      default: FurnitureStatus.ACTIVE,
      required: [true, 'Status is required'],
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

// Indexes for better query performance
FurnitureSchema.index({ itemCode: 1 }, { name: 'idx_furniture_item_code_unique', unique: true });
FurnitureSchema.index({ category: 1 }, { name: 'idx_furniture_category' });
FurnitureSchema.index({ status: 1 }, { name: 'idx_furniture_status' });
FurnitureSchema.index({ location: 1 }, { name: 'idx_furniture_location' });
FurnitureSchema.index({ status: 1, createdAt: -1 }, { name: 'idx_furniture_status_created' });

export const FurnitureModel = mongoose.model<FurnitureDocument>("Furniture", FurnitureSchema);
