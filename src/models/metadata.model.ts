import mongoose, { Schema } from "mongoose";
import { MetadataDocument } from '../interfaces';

const metadataSchema = new Schema<MetadataDocument>(
  {
    standardWorkStartTime: {
      type: String,
      required: [true, 'Standard work start time is required'],
      default: '09:00',
    },
    halfDayHoursThreshold: {
      type: Number,
      required: [true, 'Half day hours threshold is required'],
      default: 4,
    },
    autoCheckoutTime: {
      type: String,
      required: [true, 'Auto checkout time is required'],
      default: '23:59',
    },
    timeZone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    allowTimeZone: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<MetadataDocument>("Metadata", metadataSchema, "metadata");
