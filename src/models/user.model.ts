import mongoose, { Document, Schema } from "mongoose";
import { allowedUserRoles, UserRole } from "../constants";
import { UserDocument } from '../interfaces';

const userSchema = new Schema<UserDocument>(
  {
    userId: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: allowedUserRoles,
        message: '{VALUE} is not a valid role',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
userSchema.index({ userId: 1 }, { name: 'idx_user_userId', unique: true });
userSchema.index({ email: 1 }, { name: 'idx_user_email', unique: true });
userSchema.index({ username: 1 }, { name: 'idx_user_username', unique: true });
userSchema.index({ role: 1 }, { name: 'idx_user_role' });
userSchema.index({ createdAt: -1 }, { name: 'idx_user_created_desc' });

export default mongoose.model<UserDocument>("User", userSchema, "User");
