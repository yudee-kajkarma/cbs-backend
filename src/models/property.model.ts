import mongoose, { Schema } from "mongoose";
import { PropertyType, PropertyUsage, Unit, OwnershipType, PropertyStatus } from "../constants/property.constants";
import { Currency } from "../constants/common.constants";
import { PropertyDocument } from '../interfaces';

const PropertySchema = new Schema<PropertyDocument>(
  {
    propertyName: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
      maxlength: [200, 'Property name cannot exceed 200 characters'],
    },
    propertyType: {
      type: String,
      enum: {
        values: Object.values(PropertyType),
        message: '{VALUE} is not a valid property type',
      },
      required: [true, 'Property type is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [500, 'Location cannot exceed 500 characters'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area cannot be less than 1'],
    },
    unit: {
      type: String,
      enum: {
        values: Object.values(Unit),
        message: '{VALUE} is not a valid unit',
      },
      required: [true, 'Unit is required'],
    },
    propertyUsage: {
      type: String,
      enum: {
        values: Object.values(PropertyUsage),
        message: '{VALUE} is not a valid property usage',
      },
    },
    numberOfFloors: {
      type: Number,
      min: [0, 'Number of floors cannot be negative'],
    },
    ownershipType: {
      type: String,
      enum: {
        values: Object.values(OwnershipType),
        message: '{VALUE} is not a valid ownership type',
      },
      required: [true, 'Ownership type is required'],
    },
    titleDeedNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Title deed number cannot exceed 100 characters'],
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
    annualMaintenanceCost: {
      type: Number,
      min: [0, 'Annual maintenance cost cannot be negative'],
    },
    insuranceExpiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(PropertyStatus),
        message: '{VALUE} is not a valid status',
      },
      default: PropertyStatus.ACTIVE,
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
PropertySchema.index({ propertyName: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ location: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ ownershipType: 1 });

export const PropertyModel = mongoose.model<PropertyDocument>("Property", PropertySchema);
