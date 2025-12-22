import mongoose, { Schema } from "mongoose";
import { LeavePolicyDocument } from '../interfaces';

const leavePolicySchema = new Schema<LeavePolicyDocument>(
  {
    annualLeavePaid: {
      type: Number,
      required: [true, 'Annual leave (paid) is required'],
      min: [0, 'Annual leave cannot be negative'],
      default: 30,
    },
    sickLeavePaid: {
      type: Number,
      required: [true, 'Sick leave (paid) is required'],
      min: [0, 'Sick leave cannot be negative'],
      default: 15,
    },
    emergencyLeave: {
      type: Number,
      required: [true, 'Emergency leave is required'],
      min: [0, 'Emergency leave cannot be negative'],
      default: 5,
    },
    maternityLeave: {
      type: Number,
      required: [true, 'Maternity leave is required'],
      min: [0, 'Maternity leave cannot be negative'],
      default: 70,
    },
    paternityLeave: {
      type: Number,
      required: [true, 'Paternity leave is required'],
      min: [0, 'Paternity leave cannot be negative'],
      default: 3,
    },
    unpaidLeaveMax: {
      type: Number,
      required: [true, 'Maximum unpaid leave is required'],
      min: [0, 'Unpaid leave cannot be negative'],
      default: 10,
    },
    allowCarryForward: {
      type: Boolean,
      required: [true, 'Carry forward setting is required'],
      default: true,
    },
    maxCarryForwardDays: {
      type: Number,
      min: [0, 'Maximum carry forward days cannot be negative'],
      default: 10,
      validate: {
        validator: function(this: LeavePolicyDocument, value: number) {
          return !this.allowCarryForward || value >= 0;
        },
        message: 'Maximum carry forward days must be specified when carry forward is allowed',
      },
    },
    allowNegativeBalance: {
      type: Boolean,
      required: [true, 'Negative balance setting is required'],
      default: true,
    },
    maxNegativeLeaveDays: {
      type: Number,
      min: [0, 'Maximum negative leave days cannot be negative'],
      default: 5,
      validate: {
        validator: function(this: LeavePolicyDocument, value: number) {
          return !this.allowNegativeBalance || value >= 0;
        },
        message: 'Maximum negative leave days must be specified when negative balance is allowed',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
leavePolicySchema.index({ isActive: 1 }, { name: 'idx_leave_policy_active' });
leavePolicySchema.index({ createdAt: -1 }, { name: 'idx_leave_policy_created_desc' });

export default mongoose.model<LeavePolicyDocument>("LeavePolicy", leavePolicySchema, "leave_policy");
