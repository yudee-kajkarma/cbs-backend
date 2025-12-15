import { Schema, model } from "mongoose";
import { ISim } from '../interfaces/model.interface';
import { SimCarrier, SimStatus, allowedSimCarriers, allowedSimStatuses } from '../constants/sim.constants';
import { Currency, allowedCurrencies, Department, allowedDepartments } from '../constants/common.constants';

const simSchema = new Schema<ISim>(
  {
    simNumber: { 
      type: String, 
      required: [true, 'SIM number is required'], 
      trim: true, 
      unique: true,
      maxlength: [50, 'SIM number cannot exceed 50 characters']
    },
    phoneNumber: { 
      type: String, 
      trim: true, 
      unique: true, 
      sparse: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    carrier: { 
      type: String, 
      enum: {
        values: allowedSimCarriers,
        message: '{VALUE} is not a valid carrier'
      },
      required: [true, 'Carrier is required']
    },
    planType: { 
      type: String, 
      trim: true,
      maxlength: [100, 'Plan type cannot exceed 100 characters']
    },
    monthlyFee: { 
      type: Number, 
      min: [0, 'Monthly fee cannot be negative'],
      default: 0
    },
    currency: { 
      type: String,
      enum: {
        values: allowedCurrencies,
        message: '{VALUE} is not a valid currency'
      },
      default: Currency.KWD
    },
    extraCharges: { 
      type: Number,
      min: [0, 'Extra charges cannot be negative'],
      default: 0
    },
    simCharges: { 
      type: Number,
      min: [0, 'SIM charges cannot be negative'],
      default: 0
    },
    dataLimit: { 
      type: String,
      trim: true,
      maxlength: [50, 'Data limit cannot exceed 50 characters']
    },
    activationDate: { 
      type: Date
    },
    expiryDate: { 
      type: Date,
      validate: {
        validator: function(this: ISim, value: Date) {
          return !this.activationDate || !value || value >= this.activationDate;
        },
        message: 'Expiry date must be after activation date'
      }
    },
    assignedTo: { 
      type: String,
      trim: true,
      maxlength: [200, 'Assigned to cannot exceed 200 characters']
    },
    department: { 
      type: String,
      enum: {
        values: allowedDepartments,
        message: '{VALUE} is not a valid department'
      }
    },
    deviceImei: { 
      type: String, 
      unique: true, 
      sparse: true,
      trim: true,
      maxlength: [15, 'IMEI cannot exceed 15 characters']
    },
    status: { 
      type: String,
      enum: {
        values: allowedSimStatuses,
        message: '{VALUE} is not a valid status'
      },
      required: [true, 'Status is required'],
      default: SimStatus.ACTIVE
    },
    notes: { 
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
simSchema.index({ simNumber: 1 });
simSchema.index({ phoneNumber: 1 });
simSchema.index({ deviceImei: 1 });
simSchema.index({ carrier: 1 });
simSchema.index({ status: 1 });
simSchema.index({ department: 1 });
simSchema.index({ assignedTo: 1 });
simSchema.index({ expiryDate: 1 });
simSchema.index({ createdAt: -1 });

export default model<ISim>("Sim", simSchema);
