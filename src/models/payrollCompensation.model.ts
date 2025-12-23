import mongoose, { Schema } from "mongoose";
import { PayrollCompensationDocument } from '../interfaces';
import { Currency } from '../constants';
import { PaymentMethod } from "../constants/payroll-compensation.constants";

const payrollCompensationSchema = new Schema<PayrollCompensationDocument>(
  {
    socialInsuranceRate: {
      type: Number,
      required: [true, 'Social insurance rate is required'],
    },
    payrollProcessingDay: {
      type: Number,
      required: [true, 'Payroll processing day is required'],
    },
    currency: {
      type: String,
      enum: {
        values: Object.values(Currency),
        message: '{VALUE} is not a valid currency',
      },
      required: [true, 'Currency is required'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PaymentMethod),
        message: '{VALUE} is not a valid payment method',
      },
      required: [true, 'Payment method is required'],
      default: PaymentMethod.BANK_TRANSFER,
    },
    attendanceBonusAmount: {
      type: Number,
      required: [true, 'Attendance bonus amount is required'],
      min: [0, 'Attendance bonus amount cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export default mongoose.model<PayrollCompensationDocument>("PayrollCompensation", payrollCompensationSchema, "payroll_compensation");
