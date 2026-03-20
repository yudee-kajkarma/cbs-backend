import { Schema } from "mongoose";
import {
  ForecastType,
  ForecastStatus,
} from "../constants/forecast.constants";
import { ForecastDocument } from "../interfaces/model.interface";

export const forecastSchema = new Schema<ForecastDocument>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    type: {
      type: String,
      enum: Object.values(ForecastType),
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'KWD',
      required: [true, 'Currency is required'],
      trim: true,
    },
    bankAccount: {
      type: String,
      required: [true, 'Bank account is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ForecastStatus),
      default: ForecastStatus.PLANNED,
      required: [true, 'Status is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
