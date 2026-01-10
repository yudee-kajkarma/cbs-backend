import { Schema } from "mongoose";
import { LeaveApplicationDocument } from '../interfaces';
import { allowedLeaveTypes, allowedLeaveApplicationStatuses, LeaveApplicationStatus } from '../constants/leave-policy.constants';

export const leaveApplicationSchema = new Schema<LeaveApplicationDocument>(
  {
    requestId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: allowedLeaveTypes,
        message: '{VALUE} is not a valid leave type',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: LeaveApplicationDocument, value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be after or equal to start date',
      },
    },
    numberOfDays: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Number of days must be at least 1'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: allowedLeaveApplicationStatuses,
        message: '{VALUE} is not a valid status',
      },
      default: LeaveApplicationStatus.PENDING,
    },
    appliedOn: {
      type: Date,
      required: [true, 'Applied on date is required'],
      default: Date.now,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    actionDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
leaveApplicationSchema.index({ requestId: 1 }, { name: 'idx_leave_app_requestId', unique: true });
leaveApplicationSchema.index({ employeeId: 1, status: 1 }, { name: 'idx_leave_app_employee_status' });
leaveApplicationSchema.index({ status: 1, appliedOn: -1 }, { name: 'idx_leave_app_status_applied' });
leaveApplicationSchema.index({ leaveType: 1, status: 1 }, { name: 'idx_leave_app_type_status' });
leaveApplicationSchema.index({ createdAt: -1 }, { name: 'idx_leave_app_created_desc' });


// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
