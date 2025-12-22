import mongoose, { Schema } from "mongoose";
import { LeaveBalanceDocument } from '../interfaces';

const leaveBalanceSchema = new Schema<LeaveBalanceDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
      required: [true, 'Employee ID is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be after 2000'],
      max: [2100, 'Year must be before 2100'],
    },
    annualLeave: {
      totalAllocation: {
        type: Number,
        required: [true, 'Annual leave total allocation is required'],
        min: [0, 'Total allocation cannot be negative'],
      },
      used: {
        type: Number,
        required: [true, 'Used days is required'],
        min: [0, 'Used days cannot be negative'],
        default: 0,
      },
      remaining: {
        type: Number,
        required: [true, 'Remaining days is required'],
      },
    },
    sickLeave: {
      totalAllocation: {
        type: Number,
        required: [true, 'Sick leave total allocation is required'],
        min: [0, 'Total allocation cannot be negative'],
      },
      used: {
        type: Number,
        required: [true, 'Used days is required'],
        min: [0, 'Used days cannot be negative'],
        default: 0,
      },
      remaining: {
        type: Number,
        required: [true, 'Remaining days is required'],
      },
    },
    emergencyLeave: {
      totalAllocation: {
        type: Number,
        required: [true, 'Emergency leave total allocation is required'],
        min: [0, 'Total allocation cannot be negative'],
      },
      used: {
        type: Number,
        required: [true, 'Used days is required'],
        min: [0, 'Used days cannot be negative'],
        default: 0,
      },
      remaining: {
        type: Number,
        required: [true, 'Remaining days is required'],
      },
    },
    unpaidLeave: {
      totalAllowed: {
        type: Number,
        required: [true, 'Unpaid leave total allowed is required'],
        min: [0, 'Total allowed cannot be negative'],
      },
      used: {
        type: Number,
        required: [true, 'Used days is required'],
        min: [0, 'Used days cannot be negative'],
        default: 0,
      },
      remaining: {
        type: Number,
        required: [true, 'Remaining days is required'],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { name: 'idx_leave_balance_employee_year', unique: true });
leaveBalanceSchema.index({ createdAt: -1 }, { name: 'idx_leave_balance_created_desc' });

export default mongoose.model<LeaveBalanceDocument>("LeaveBalance", leaveBalanceSchema, "leave_balance");
