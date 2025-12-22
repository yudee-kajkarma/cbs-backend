import mongoose, { Schema } from "mongoose";
import { AttendancePolicyDocument } from '../interfaces';

const attendancePolicySchema = new Schema<AttendancePolicyDocument>(
  {
    standardHoursPerDay: {
      type: Number,
      required: [true, 'Standard hours per day is required'],
      min: [0, 'Standard hours cannot be negative'],
      max: [24, 'Standard hours cannot exceed 24'],
      default: 8,
    },
    workingDaysPerWeek: {
      type: Number,
      required: [true, 'Working days per week is required'],
      min: [1, 'Working days must be at least 1'],
      max: [7, 'Working days cannot exceed 7'],
      default: 5,
    },
    overtimeRateMultiplier: {
      type: Number,
      required: [true, 'Overtime rate multiplier is required'],
      min: [1, 'Overtime rate multiplier must be at least 1'],
      default: 1.5,
    },
    lateArrivalGracePeriod: {
      type: Number,
      required: [true, 'Late arrival grace period is required'],
      min: [0, 'Grace period cannot be negative'],
      default: 15,
    },
    attendanceBonusThreshold: {
      type: Number,
      required: [true, 'Attendance bonus threshold is required'],
      min: [0, 'Attendance bonus threshold cannot be negative'],
      max: [100, 'Attendance bonus threshold cannot exceed 100'],
      default: 100,
    },
    hoursConcessionPercentage: {
      type: Number,
      required: [true, 'Hours concession percentage is required'],
      min: [0, 'Hours concession percentage cannot be negative'],
      max: [100, 'Hours concession percentage cannot exceed 100'],
      default: 10,
    },
    shortfallDeductionPercentage: {
      type: Number,
      required: [true, 'Shortfall deduction percentage is required'],
      min: [0, 'Shortfall deduction percentage cannot be negative'],
      max: [100, 'Shortfall deduction percentage cannot exceed 100'],
      default: 30,
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
