import mongoose, { Schema } from "mongoose";
import { AttendancePolicyDocument } from '../interfaces';

const attendancePolicySchema = new Schema<AttendancePolicyDocument>(
  {
    standardHoursPerDay: {
      type: Number,
      required: [true, 'Standard hours per day is required'],
    },
    workingDaysPerWeek: {
      type: Number,
      required: [true, 'Working days per week is required'],
    },
    overtimeRateMultiplier: {
      type: Number,
      required: [true, 'Overtime rate multiplier is required'],
      min: [1, 'Overtime rate multiplier must be at least 1'],
    },
    lateArrivalGracePeriod: {
      type: Number,
      required: [true, 'Late arrival grace period is required'],
      min: [0, 'Grace period cannot be negative'],
    },
    attendanceBonusThreshold: {
      type: Number,
      required: [true, 'Attendance bonus threshold is required'],
      min: [0, 'Attendance bonus threshold cannot be negative'],
      max: [100, 'Attendance bonus threshold cannot exceed 100'],
    },
    hoursConcessionPercentage: {
      type: Number,
      required: [true, 'Hours concession percentage is required'],
    },
    shortfallDeductionPercentage: {
      type: Number,
      required: [true, 'Shortfall deduction percentage is required'],
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

// Indexes for performance
attendancePolicySchema.index({ isActive: 1 });

export default mongoose.model<AttendancePolicyDocument>("AttendancePolicy", attendancePolicySchema, "attendance_policy");
