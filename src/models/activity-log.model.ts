import { Schema } from "mongoose";
import { ActivityLogDocument } from '../interfaces';
import { ActivityType, allowedActivityTypes, ActivityModule, allowedActivityModules } from '../constants/activity-log.constants';

export const activityLogSchema = new Schema<ActivityLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    activityType: {
      type: String,
      enum: allowedActivityTypes,
      required: [true, 'Activity type is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      maxlength: [200, 'Action cannot exceed 200 characters'],
    },
    module: {
      type: String,
      enum: allowedActivityModules,
      required: [true, 'Module is required'],
    },
    entityType: {
      type: String,
      maxlength: [100, 'Entity type cannot exceed 100 characters'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ employeeId: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });


// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
