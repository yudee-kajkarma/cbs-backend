
import { Schema, model } from "mongoose";
import { INetworkEquipment } from '../interfaces/model.interface';
import { EquipmentStatus, allowedEquipmentStatuses, allowedEquipmentTypes } from '../constants/network-equipment.constants';

export const networkEquipmentSchema = new Schema<INetworkEquipment>(
  {
    equipmentName: { 
      type: String, 
      required: [true, 'Equipment name is required'],
      trim: true,
      maxlength: [200, 'Equipment name cannot exceed 200 characters']
    },
    equipmentType: { 
     type: String, 
      enum: {
        values: allowedEquipmentTypes,
        message: '{VALUE} is not a valid type'
      },
      required: [true, 'Type is required'],
    },
    ipAddress: { 
      type: String,
      trim: true,
      maxlength: [45, 'IP address cannot exceed 45 characters']
    },
    macAddress: { 
      type: String, 
      required: [true, 'MAC address is required'],
      trim: true,
      maxlength: [17, 'MAC address cannot exceed 17 characters']
    },
    serialNumber: { 
      type: String, 
      required: [true, 'Serial number is required'],
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters']
    },
    numberOfPorts: { 
      type: Number, 
      required: [true, 'Number of ports is required'],
      min: [0, 'Number of ports cannot be negative']
    },
    location: { 
      type: String, 
      required: [true, 'Location is required'],
      trim: true
    },
    purchaseDate: { 
      type: Date, 
      required: [true, 'Purchase date is required']
    },
    warrantyExpiry: { 
      type: Date, 
      required: [true, 'Warranty expiry is required'],
      validate: {
        validator: function(this: INetworkEquipment, value: Date) {
          return !this.purchaseDate || value >= this.purchaseDate;
        },
        message: 'Warranty expiry must be after purchase date'
      }
    },
    firmwareVersion: { 
      type: String, 
      required: [true, 'Firmware version is required'],
      trim: true,
      maxlength: [50, 'Firmware version cannot exceed 50 characters']
    },
    status: {
      type: String,
      enum: {
        values: allowedEquipmentStatuses,
        message: '{VALUE} is not a valid status'
      },
      required: [true, 'Status is required'],
      default: EquipmentStatus.ONLINE
    },
    wifiPassword: {
      type: String,
      trim: true,
      default: undefined
    }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better query performance
networkEquipmentSchema.index({ equipmentName: 1 });
networkEquipmentSchema.index({ equipmentType: 1 });
networkEquipmentSchema.index({ serialNumber: 1 });
networkEquipmentSchema.index({ macAddress: 1 });
networkEquipmentSchema.index({ location: 1 });
networkEquipmentSchema.index({ status: 1 });
networkEquipmentSchema.index({ createdAt: -1 });


// Schema only - Model is created by tenant-aware proxy in src/models/index.ts
