import mongoose, { Document, Schema } from "mongoose";
import { allowedAuditTypes, AuditType } from "../constants";
import { Audit, AuditDocument } from '../interfaces';

const auditSchema = new Schema<AuditDocument>(
  {
    name: {
      type: String,
      required: [true, 'Audit name is required'],
      trim: true,
      maxlength: [200, 'Audit name cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Audit type is required'],
      enum: {
        values: allowedAuditTypes,
        message: '{VALUE} is not a valid audit type',
      },
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start date is required'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end date is required'],
      validate: {
        validator: function(this: AuditDocument, value: Date) {
          return !this.periodStart || value >= this.periodStart;
        },
        message: 'Period end date must be after period start date',
      },
    },
    auditor: {
      type: String,
      required: [true, 'Auditor name is required'],
      trim: true,
      maxlength: [100, 'Auditor name cannot exceed 100 characters'],
    },
    completionDate: {
      type: Date,
      required: [true, 'Completion date is required'],
    },
    fileKey: {
      type: String,
      trim: true,
      maxlength: [500, 'File key cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
auditSchema.index({ type: 1 }, { name: 'idx_audit_type' });
auditSchema.index({ completionDate: -1 }, { name: 'idx_audit_completion_date_desc' });
auditSchema.index({ createdAt: -1 }, { name: 'idx_audit_created_desc' });
auditSchema.index({ auditor: 1, createdAt: -1 }, { name: 'idx_audit_auditor_created' });

export default mongoose.model<AuditDocument>("Audit", auditSchema);
