import { Document } from 'mongoose';
import { AuditType } from '../constants';
import { 
  FurnitureCategory, 
  FurnitureCondition, 
  FurnitureStatus, 
  Currency 
} from '../constants';
import {
  HardwareType,
  OperatingSystem,
  RAM,
  Storage,
  HardwareStatus,
  Department
} from '../constants';

/**
 * Audit Interfaces
 */
export interface Audit {
  name: string;
  type: AuditType;
  periodStart: Date;
  periodEnd: Date;
  auditor: string;
  completionDate: Date;
  fileKey?: string;
}

export interface AuditDocument extends Audit, Document {}

/**
 * Furniture Interfaces
 */
export interface Furniture {
  itemName: string;
  itemCode: string;
  category: FurnitureCategory;
  quantity: number;
  condition?: FurnitureCondition;
  material?: string;
  color?: string;
  dimensions?: string;
  location: string;
  assignedTo?: string;
  supplier?: string;
  purchaseDate?: Date;
  unitValue?: number;
  purchaseCurrency?: Currency;
  currentUnitValue?: number;
  currentCurrency?: Currency;
  warrantyExpiry?: Date;
  maintenanceSchedule?: string;
  status: FurnitureStatus;
  notes?: string;
}

export interface FurnitureDocument extends Furniture, Document {}

/**
 * Hardware Interfaces
 */
export interface NewHardware {
  deviceName: string;
  type: HardwareType;
  serialNumber: string;
  operatingSystem: OperatingSystem;
  processor?: string;
  ram?: RAM;
  storage?: Storage;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  assignedTo?: string;
  department?: Department;
  status: HardwareStatus;
  submittedBy?: string;
}

export interface NewHardwareDocument extends NewHardware, Document {}

/**
 * Sim Model Interfaces
 */
export interface ISim extends Document {
  simNumber: string;
  phoneNumber?: string;
  carrier: string;
  planType?: string;
  monthlyFee?: number;
  currency?: string;
  extraCharges?: number;
  simCharges?: number;
  dataLimit?: string;
  activationDate?: Date | null;
  expiryDate?: Date | null;
  assignedTo?: string | null;
  department?: string;
  deviceImei?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupport extends Document {
  ticketTitle: string;
  category: string;
  priority: string;
  department: string;
  assignTo: string;
  description: string;
  submittedBy: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INetworkEquipment extends Document {
  equipmentName: string;
  equipmentType: string;
  ipAddress?: string;
  macAddress: string;
  serialNumber: string;
  numberOfPorts: number;
  location: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  firmwareVersion: string;
  status: string;
}

export interface ISoftware extends Document {
  name: string;
  vendor: string;
  licenseType: string;
  licenseKey: string;
  totalSeats: number;
  seatsUsed: number;
  purchaseDate: Date;
  expiryDate: Date;
  renewalCost: string;
  assignedDepartment: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILicense extends Document {
  name: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  documentKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISO extends Document {
  certificateName: string;
  isoStandard: string;
  issueDate: Date;
  expiryDate: Date;
  certifyingBody: string;
  fileKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHardwareTransfer extends Document {
  hardwareName: string;
  serialNumber: string;
  fromUser: string;
  toUser: string;
  transferDate: Date;
  expectedReturnDate?: Date | null;
  transferType: string;
  hardwareCondition: string;
  transferReason?: string;
  approvedBy?: string;
  additionalNotes?: string;
  status: string;
}

/**
 * Property Interfaces
 */
export interface Property {
  propertyName: string;
  propertyType: string;
  location: string;
  area: number;
  unit: string;
  propertyUsage?: string;
  numberOfFloors?: number;
  ownershipType: string;
  titleDeedNumber?: string;
  purchaseDate?: Date;
  purchaseValue?: number;
  purchaseCurrency?: string;
  currentValue?: number;
  currentCurrency?: string;
  annualMaintenanceCost?: number;
  insuranceExpiryDate?: Date;
  status: string;
  notes?: string;
}

export interface PropertyDocument extends Property, Document {}

/**
 * Vehicle Interfaces
 */
export interface Vehicle {
  vehicleName: string;
  makeBrand: string;
  vehicleModel?: string;
  vehicleType: string;
  year: number;
  color?: string;
  fuelType: string;
  chassisNumber: string;
  engineNumber?: string;
  plateNumber: string;
  registrationExpiry?: Date;
  insuranceProvider?: string;
  insuranceExpiry?: Date;
  purchaseDate?: Date;
  purchaseValue?: number;
  purchaseCurrency?: string;
  currentValue?: number;
  currentCurrency?: string;
  assignedTo?: string;
  department?: string;
  mileage?: number;
  lastService?: Date;
  nextService?: Date;
  status: string;
  notes?: string;
}

export interface VehicleDocument extends Vehicle, Document {}

/**
 * Equipment Interfaces
 */
export interface Equipment {
  equipmentName: string;
  category: string;
  manufacturer?: string;
  equipmentModel?: string;
  serialNumber: string;
  condition?: string;
  location: string;
  assignedTo?: string;
  purchaseDate?: Date;
  purchaseValue?: number;
  purchaseCurrency?: string;
  currentValue?: number;
  currentCurrency?: string;
  warrantyProvider?: string;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceContract?: string;
  status: string;
  technicalSpecifications?: string;
  notes?: string;
}

export interface EquipmentDocument extends Equipment, Document {}
