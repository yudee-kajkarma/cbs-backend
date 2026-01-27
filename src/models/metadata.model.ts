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
    isActive: {
      type: Boolean,
      default: true,
    },
    companyIpRanges: {
      type: [String],
      default: [],
      validate: {
        validator: function(ranges: string[]) {
          if (!Array.isArray(ranges)) return false;
          return ranges.every(range => {
            if (typeof range !== 'string') return false;
            const [subnet, mask] = range.trim().split('/');
            if (!subnet || !mask) return false;
            const maskInt = parseInt(mask, 10);
            return !isNaN(maskInt) && maskInt >= 0 && maskInt <= 128;
          });
        },
        message: 'Each IP range must be in CIDR format (e.g., 192.168.1.0/24 or 2001:db8::/32)'
      }
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<MetadataDocument>("Metadata", metadataSchema, "metadata");
