import mongoose, { Schema } from "mongoose";
import { EmployeeBonusDocument } from '../interfaces';

const employeeBonusSchema = new Schema<EmployeeBonusDocument>(
  {
    bonusId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
      required: [true, 'Employee ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Bonus amount is required'],
      min: [0, 'Bonus amount cannot be negative'],
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
employeeBonusSchema.index({ bonusId: 1 }, { name: 'idx_employee_bonus_bonusId', unique: true });
employeeBonusSchema.index({ employeeId: 1, month: 1, year: 1 }, { name: 'idx_employee_bonus_employee_period' });
employeeBonusSchema.index({ month: 1, year: 1 }, { name: 'idx_employee_bonus_period' });
employeeBonusSchema.index({ createdAt: -1 }, { name: 'idx_employee_bonus_created_desc' });

export default mongoose.model<EmployeeBonusDocument>("EmployeeBonus", employeeBonusSchema, "employee_bonus");
