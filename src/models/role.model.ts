import { Schema, Document, Types } from 'mongoose';

/**
 * Role Schema
 */
export const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters'],
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    permissions: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'Role',
  }
);

// Create indexes
roleSchema.index(
  { name: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true }, name: 'idx_role_name_active_unique' }
);
roleSchema.index({ createdAt: -1 }, { name: 'idx_role_created_at' });
roleSchema.index({ isSystemRole: 1 }, { name: 'idx_role_system_role' });
roleSchema.index({ isActive: 1 }, { name: 'idx_role_active' });

export interface RoleDocument extends Document {
  name: string;
  description?: string;
  permissions: Record<string, Record<string, number>>;
  isSystemRole: boolean;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}



// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
