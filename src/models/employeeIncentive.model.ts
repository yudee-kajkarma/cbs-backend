import { Schema } from "mongoose";
import { EmployeeIncentiveDocument } from '../interfaces';

export const employeeIncentiveSchema = new Schema<EmployeeIncentiveDocument>(
  {
    incentiveId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Incentive amount is required'],
      min: [0, 'Incentive amount cannot be negative'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
employeeIncentiveSchema.index({ incentiveId: 1 }, { name: 'idx_employee_incentive_incentiveId', unique: true });
employeeIncentiveSchema.index({ employeeId: 1, month: 1, year: 1 }, { name: 'idx_employee_incentive_employee_period' });
employeeIncentiveSchema.index({ month: 1, year: 1 }, { name: 'idx_employee_incentive_period' });
employeeIncentiveSchema.index({ createdAt: -1 }, { name: 'idx_employee_incentive_created_desc' });


// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
