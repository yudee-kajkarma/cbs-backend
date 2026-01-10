import { Schema } from "mongoose";
import { allowedUserRoles, UserRole } from "../constants";
import { UserDocument } from '../interfaces';

// NOTE: This schema is for business data in CBS_{tenantRefId} database
// Authentication data (username, email, password) is stored in identity_db
export const userSchema = new Schema<UserDocument>(
  {
    userId: {
      type: String,
      trim: true,
    },
    userRefId: {
      type: String,
      required: [true, 'User reference ID is required'],
      trim: true,
      index: true,
    },
    tenantRefId: {
      type: String,
      required: [true, 'Tenant reference ID is required'],
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: allowedUserRoles,
        message: '{VALUE} is not a valid role',
      },
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
userSchema.index({ userId: 1 }, { name: 'idx_user_userId', unique: true });
userSchema.index({ userRefId: 1 }, { name: 'idx_user_userRefId', unique: true });
userSchema.index({ role: 1 }, { name: 'idx_user_role' });
userSchema.index({ roles: 1 }, { name: 'idx_user_roles' });
userSchema.index({ createdAt: -1 }, { name: 'idx_user_created_desc' });

// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
