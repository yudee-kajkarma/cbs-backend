import mongoose from 'mongoose';
import { IdentityUserDocument } from '../interfaces';

/**
 * Identity User Schema
 * Stores authentication credentials in CBS_Admin database
 * Ensures global uniqueness of username and email across all tenants
 * 
 * This is the central authentication store that maps to tenant-specific User records
 * via userRefId. When a user logs in, we:
 * 1. Validate credentials against this CBS_Admin.users collection
 * 2. Use userRefId to fetch business data from CBS_{tenantRefId}.users
 */
export const identityUserSchema = new mongoose.Schema<IdentityUserDocument>(
  {
    userRefId: {
      type: String,
      required: [true, 'User reference ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    tenantRefId: {
      type: String,
      required: [true, 'Tenant reference ID is required'],
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true, // GLOBAL uniqueness across all tenants
      trim: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // GLOBAL uniqueness across all tenants
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for query performance
identityUserSchema.index({ username: 1 }, { unique: true, name: 'idx_identity_username' });
identityUserSchema.index({ email: 1 }, { unique: true, name: 'idx_identity_email' });
identityUserSchema.index({ userRefId: 1 }, { unique: true, name: 'idx_identity_userRefId' });
identityUserSchema.index({ tenantRefId: 1 }, { name: 'idx_identity_tenantRefId' });
identityUserSchema.index({ createdAt: -1 }, { name: 'idx_identity_created_desc' });
