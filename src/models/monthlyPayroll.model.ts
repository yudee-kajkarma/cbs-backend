import mongoose, { Schema } from "mongoose";
import { MonthlyPayrollDocument } from '../interfaces';
import { MonthlyPayrollStatus, allowedMonthlyPayrollStatuses } from '../constants/monthly-payroll.constants';

const monthlyPayrollSchema = new Schema<MonthlyPayrollDocument>(
  {
    payrollId: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
      required: [true, 'Employee ID is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    totalSalary: {
      type: Number,
      required: [true, 'Total salary is required'],
      min: [0, 'Total salary cannot be negative'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Basic salary cannot be negative'],
    },
    attendancePercentage: {
      type: Number,
      required: [true, 'Attendance percentage is required'],
      min: [0, 'Attendance percentage cannot be negative'],
      max: [100, 'Attendance percentage cannot exceed 100'],
      default: 0,
    },
    workingDays: {
      type: Number,
      required: [true, 'Working days is required'],
      min: [0, 'Working days cannot be negative'],
      default: 0,
    },
    presentDays: {
      type: Number,
      required: [true, 'Present days is required'],
      min: [0, 'Present days cannot be negative'],
      default: 0,
    },
    absentDays: {
      type: Number,
      required: [true, 'Absent days is required'],
      min: [0, 'Absent days cannot be negative'],
      default: 0,
    },
    unpaidLeaveDays: {
      type: Number,
      required: [true, 'Unpaid leave days is required'],
      min: [0, 'Unpaid leave days cannot be negative'],
      default: 0,
    },
    salaryDeduction: {
      type: Number,
      required: [true, 'Salary deduction is required'],
      min: [0, 'Salary deduction cannot be negative'],
      default: 0,
    },
    socialInsurance: {
      type: Number,
      required: [true, 'Social insurance is required'],
      min: [0, 'Social insurance cannot be negative'],
      default: 0,
    },
    totalDeductions: {
      type: Number,
      required: [true, 'Total deductions is required'],
      min: [0, 'Total deductions cannot be negative'],
      default: 0,
    },
    bonusAmount: {
      type: Number,
      min: [0, 'Bonus amount cannot be negative'],
      default: 0,
    },
    incentiveAmount: {
      type: Number,
      min: [0, 'Incentive amount cannot be negative'],
      default: 0,
    },
    overtimePay: {
      type: Number,
      min: [0, 'Overtime pay cannot be negative'],
      default: 0,
    },
    netSalary: {
      type: Number,
      required: [true, 'Net salary is required'],
      min: [0, 'Net salary cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: allowedMonthlyPayrollStatuses,
        message: '{VALUE} is not a valid status',
      },
      default: MonthlyPayrollStatus.PENDING,
    },
    processedDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
monthlyPayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { name: 'idx_monthly_payroll_employee_period', unique: true });
monthlyPayrollSchema.index({ status: 1 }, { name: 'idx_monthly_payroll_status' });
monthlyPayrollSchema.index({ month: 1, year: 1 }, { name: 'idx_monthly_payroll_period' });
monthlyPayrollSchema.index({ createdAt: -1 }, { name: 'idx_monthly_payroll_created_desc' });

export default mongoose.model<MonthlyPayrollDocument>("MonthlyPayroll", monthlyPayrollSchema, "monthly_payroll");
