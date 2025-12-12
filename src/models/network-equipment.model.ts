
import { Schema, model, Document } from "mongoose";
import { INetworkEquipment } from '../interfaces';

const NetworkEquipmentSchema = new Schema<INetworkEquipment>(
  {
    equipmentName: { type: String, required: true },
    equipmentType: { type: String, required: true },

    ipAddress: { type: String }, // duplicates allowed
    macAddress: { type: String, required: true },
    serialNumber: { type: String, required: true },

    numberOfPorts: { type: Number, required: true },
    location: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    warrantyExpiry: { type: Date, required: true },
    firmwareVersion: { type: String, required: true },
    status: { type: String, required: true }
  },
  { 
    timestamps: true,
    versionKey: false
  }
);

// No unique index, since you check duplicates in controller
// If you want unique enforced by DB, tell me.

export const NetworkEquipmentModel = model<INetworkEquipment>(
  "NetworkEquipment",
  NetworkEquipmentSchema
);
