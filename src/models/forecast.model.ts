import mongoose, { Schema } from "mongoose";
import { 
  ForecastType, 
  ForecastStatus, 
  ForecastCategory
} from "../constants/forecast.constants";
import { ForecastDocument } from "../interfaces/model.interface";

const forecastSchema = new Schema<ForecastDocument>(
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
      enum: Object.values(ForecastCategory),
      required: [true, 'Category is required'],
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


export default mongoose.model<ForecastDocument>("Forecast", forecastSchema, "forecast");
