import { Schema } from 'mongoose';
import { TenantDocument } from '../interfaces/model.interface';

/**
 * Tenant Status Enum
 */
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

/**
 * Tenant Schema
 * NOTE: This schema is stored in the CBS_Admin database
 * It manages metadata about all tenants in the system
 */
export const tenantSchema = new Schema<TenantDocument>(
  {
    tenantRefId: {
      type: String,
      required: [true, 'Tenant reference ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    companyEmail: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
    },
    companyPhone: {
      type: String,
      required: [true, 'Company phone is required'],
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    address: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TenantStatus),
        message: '{VALUE} is not a valid status',
      },
      default: TenantStatus.PENDING,
      index: true,
    },
    adminUsername: {
      type: String,
      trim: true,
      // Temporarily stored until tenant is activated
    },
    adminPassword: {
      type: String,
      // Hashed password - removed after activation
    },
    isProvisioned: {
      type: Boolean,
      default: false,
      // True if database and admin user have been created
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
tenantSchema.index({ status: 1, createdAt: -1 }, { name: 'idx_tenant_status_created' });
tenantSchema.index({ companyEmail: 1 }, { name: 'idx_tenant_email', unique: true });
tenantSchema.index({ tenantRefId: 1 }, { name: 'idx_tenant_refId', unique: true });

// Schema only - Model is created in admin database connection
