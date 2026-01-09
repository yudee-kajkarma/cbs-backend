import mongoose, { Schema } from "mongoose";
import { EmployeeMongoDocument } from '../interfaces';
import { allowedEmployeeStatuses, EmployeeStatus } from '../constants';

const employeeSchema = new Schema<EmployeeMongoDocument>(
  {
    employeeId: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    department: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    joinDate: {
      type: Date,
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: allowedEmployeeStatuses,
        message: '{VALUE} is not a valid status',
      },
      default: EmployeeStatus.ACTIVE,
    },
    documents: [
      {
        fileKey: {
          type: String,
          required: [true, 'File key is required'],
          trim: true,
          maxlength: [500, 'File key cannot exceed 500 characters'],
        },
        expiryDate: {
          type: Date,
          required: [true, 'Expiry date is required'],
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

employeeSchema.index({ employeeId: 1 }, { name: 'idx_employee_employeeId', unique: true });
employeeSchema.index({ userId: 1 }, { name: 'idx_employee_userId', unique: true });
employeeSchema.index({ department: 1 }, { name: 'idx_employee_department' });
employeeSchema.index({ status: 1 }, { name: 'idx_employee_status' });
employeeSchema.index({ createdAt: -1 }, { name: 'idx_employee_created_desc' });

export default mongoose.model<EmployeeMongoDocument>("employee", employeeSchema, "employee");
