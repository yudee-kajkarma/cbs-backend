import mongoose, { Schema } from "mongoose";
import { VehicleType, FuelType, VehicleStatus, VehicleDepartment } from "../constants/vehicle.constants";
import { Currency } from "../constants/common.constants";
import { VehicleDocument } from '../interfaces/model.interface';

const vehicleSchema = new Schema<VehicleDocument>(
  {
    vehicleName: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
      maxlength: [200, 'Vehicle name cannot exceed 200 characters'],
    },
    makeBrand: {
      type: String,
      required: [true, 'Make/Brand is required'],
      trim: true,
      maxlength: [100, 'Make/Brand cannot exceed 100 characters'],
    },
    vehicleModel: {
      type: String,
      trim: true,
      maxlength: [100, 'Model cannot exceed 100 characters'],
    },
    vehicleType: {
      type: String,
      enum: {
        values: Object.values(VehicleType),
        message: '{VALUE} is not a valid vehicle type',
      },
      required: [true, 'Vehicle type is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year cannot be less than 1900'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, 'Color cannot exceed 50 characters'],
    },
    fuelType: {
      type: String,
      enum: {
        values: Object.values(FuelType),
        message: '{VALUE} is not a valid fuel type',
      },
      required: [true, 'Fuel type is required'],
    },
    chassisNumber: {
      type: String,
      required: [true, 'Chassis number (VIN) is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Chassis number cannot exceed 50 characters'],
    },
    engineNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Engine number cannot exceed 50 characters'],
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      trim: true,
      maxlength: [50, 'Plate number cannot exceed 50 characters'],
    },
    registrationExpiry: {
      type: Date,
    },
    insuranceProvider: {
      type: String,
      trim: true,
      maxlength: [100, 'Insurance provider cannot exceed 100 characters'],
    },
    insuranceExpiry: {
      type: Date,
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
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [100, 'Assigned to cannot exceed 100 characters'],
    },
    department: {
      type: String,
      enum: {
        values: Object.values(VehicleDepartment),
        message: '{VALUE} is not a valid department',
      },
    },
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
    },
    lastService: {
      type: Date,
    },
    nextService: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(VehicleStatus),
        message: '{VALUE} is not a valid status',
      },
      default: VehicleStatus.ACTIVE,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
vehicleSchema.index({ vehicleName: 1 }, { name: 'idx_vehicle_name' });
vehicleSchema.index({ chassisNumber: 1 }, { name: 'idx_vehicle_chassis', unique: true });
vehicleSchema.index({ plateNumber: 1 }, { name: 'idx_vehicle_plate' });
vehicleSchema.index({ vehicleType: 1 }, { name: 'idx_vehicle_type' });
vehicleSchema.index({ status: 1 }, { name: 'idx_vehicle_status' });
vehicleSchema.index({ department: 1 }, { name: 'idx_vehicle_department' });
vehicleSchema.index({ createdAt: -1 }, { name: 'idx_vehicle_created_desc' });

export default mongoose.model<VehicleDocument>("Vehicle", vehicleSchema);
