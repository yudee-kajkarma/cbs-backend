import mongoose, { Schema } from "mongoose";
import { AttendanceDocument } from '../interfaces';
import { AttendanceStatus } from '../constants/attendance.constants';

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
      required: [true, 'Employee ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkInTime: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkInIP: {
      type: String,
      required: [true, 'Check-in IP is required'],
    },
    checkOutTime: {
      type: Date,
    },
    checkOutIP: {
      type: String,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    isLateArrival: {
      type: Boolean,
      default: false,
    },
    lateArrivalMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true }); 
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ date: 1, checkInTime: 1 });
attendanceSchema.index({ createdAt: -1 });

export default mongoose.model<AttendanceDocument>("Attendance", attendanceSchema, "attendance");
