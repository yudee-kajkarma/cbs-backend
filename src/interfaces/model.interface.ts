import { Document, Types } from 'mongoose';
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

// ============================================================================
// COMMON INTERFACES
// ============================================================================

/**
 * Base Query Interface - Common pagination and sorting parameters
 */
export interface BaseQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================================================
// AUDIT MODULE
// ============================================================================

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

export interface AuditQuery extends BaseQuery {
  type?: string;
}

export interface CreateAuditData extends Partial<Audit> {
  fileKey?: string;
}

export interface UpdateAuditData extends Partial<Audit> {
  fileKey?: string;
}

// ============================================================================
// DOCUMENT MODULE
// ============================================================================

export interface IDocument extends Document {
  name: string;
  category: string;
  documentDate: Date;
  partiesInvolved: string;
  fileKey?: string;
}

export interface DocumentQuery extends BaseQuery {
  category?: string;
  status?: string;
}

export interface CreateDocumentData {
  name: string;
  category: string;
  documentDate: Date;
  partiesInvolved: string;
  fileKey?: string;
}

export interface UpdateDocumentData extends Partial<CreateDocumentData> {}

// ============================================================================
// FURNITURE MODULE
// ============================================================================

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

export interface FurnitureQuery extends BaseQuery {
  category?: string;
  condition?: string;
  status?: string;
  location?: string;
}

export interface CreateFurnitureData extends Partial<Furniture> {}
export interface UpdateFurnitureData extends Partial<Furniture> {}

// ============================================================================
// HARDWARE MODULE
// ============================================================================

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

export interface NewHardwareQuery extends BaseQuery {
  type?: string;
  status?: string;
  department?: string;
  assignedTo?: string;
}

export interface CreateNewHardwareData extends Partial<NewHardware> {}
export interface UpdateNewHardwareData extends Partial<NewHardware> {}

// ============================================================================
// SIM MODULE
// ============================================================================

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

export interface SimQuery extends BaseQuery {
  carrier?: string;
  status?: string;
  department?: string;
  assignedTo?: string;
}

export interface CreateSimData extends Partial<ISim> {}
export interface UpdateSimData extends Partial<ISim> {}

// ============================================================================
// SUPPORT MODULE
// ============================================================================

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

export interface SupportQuery extends BaseQuery {
  category?: string;
  priority?: string;
  status?: string;
  department?: string;
  assignTo?: string;
}

export interface CreateSupportData extends Partial<ISupport> {}
export interface UpdateSupportData extends Partial<ISupport> {}

// ============================================================================
// NETWORK EQUIPMENT MODULE
// ============================================================================

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

export interface NetworkEquipmentQuery extends BaseQuery {
  equipmentType?: string;
  status?: string;
  location?: string;
}

export interface CreateNetworkEquipmentData extends Partial<INetworkEquipment> {}
export interface UpdateNetworkEquipmentData extends Partial<INetworkEquipment> {}

// ============================================================================
// SOFTWARE MODULE
// ============================================================================

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

export interface SoftwareQuery extends BaseQuery {
  status?: string;
  licenseType?: string;
  assignedDepartment?: string;
}

export interface CreateSoftwareData extends Partial<ISoftware> {}
export interface UpdateSoftwareData extends Partial<ISoftware> {}

// ============================================================================
// LICENSE MODULE
// ============================================================================

export interface ILicense extends Document {
  name: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  fileKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LicenseQuery extends BaseQuery {}

export interface CreateLicenseData extends Partial<ILicense> {}
export interface UpdateLicenseData extends Partial<ILicense> {}

// ============================================================================
// ISO MODULE
// ============================================================================

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

export interface ISOQuery extends BaseQuery {
  isoStandard?: string;
}

export interface CreateISOData extends Partial<ISO> {}
export interface UpdateISOData extends Partial<ISO> {}

// ============================================================================
// HARDWARE TRANSFER MODULE
// ============================================================================

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

export interface HardwareTransferQuery extends BaseQuery {
  status?: string;
  transferType?: string;
  fromUser?: string;
  toUser?: string;
}

export interface CreateHardwareTransferData extends Partial<IHardwareTransfer> {}
export interface UpdateHardwareTransferData extends Partial<IHardwareTransfer> {}

// ============================================================================
// PROPERTY MODULE
// ============================================================================

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

export interface PropertyQuery extends BaseQuery {
  propertyType?: string;
  location?: string;
  ownershipType?: string;
  status?: string;
}

export interface CreatePropertyData extends Partial<Property> {}
export interface UpdatePropertyData extends Partial<Property> {}

// ============================================================================
// VEHICLE MODULE
// ============================================================================

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

export interface VehicleQuery extends BaseQuery {
  vehicleType?: string;
  fuelType?: string;
  status?: string;
  department?: string;
  assignedTo?: string;
}

export interface CreateVehicleData extends Partial<Vehicle> {}
export interface UpdateVehicleData extends Partial<Vehicle> {}

// ============================================================================
// EQUIPMENT MODULE
// ============================================================================

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

export interface EquipmentQuery extends BaseQuery {
  category?: string;
  condition?: string;
  status?: string;
  location?: string;
  assignedTo?: string;
}

export interface CreateEquipmentData extends Partial<Equipment> {}
export interface UpdateEquipmentData extends Partial<Equipment> {}


// ============================================================================
// Bank Account MODULE
// ============================================================================

export interface BankAccount {
  bankName: string;
  branch?: string;
  accountHolder: string;
  accountNumber: string;
  currency?: Currency;
  currentChequeNumber?: string;
  address?: string;
  fileKey?: string;
}

export interface BankAccountDocument extends BankAccount, Document {}

export interface BankAccountQuery extends BaseQuery {
  bankName?: string;
  branch?: string;
  accountHolder?: string;
  accountNumber?: string;
}

export interface CreateBankAccountData extends Partial<BankAccount> {}
export interface UpdateBankAccountData extends Partial<BankAccount> {}

// ============================================================================
// BANK BALANCE MODULE
// ============================================================================

export interface BankBalance {
  account: string;
  bank: string;
  branch?: string;
  type: string;
  currentBalance: number;
  currency: string;
  displayCurrency?: string;
  finalBalance?: number;
  status?: string;
}

export interface BankBalanceDocument extends BankBalance, Document {}

export interface BankBalanceQuery extends BaseQuery {
  account?: string;
  bank?: string;
  branch?: string;
  type?: string;
  status?: string;
  currency?: string;
}

export interface CreateBankBalanceData extends Partial<BankBalance> {}
export interface UpdateBankBalanceData extends Partial<BankBalance> {}
// FORECAST MODULE
// ============================================================================

export interface Forecast {
  date: Date;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  bankAccount: string;
  status: string;
}

export interface ForecastDocument extends Forecast, Document {}

export interface ForecastQuery extends BaseQuery {
  type?: string;
  category?: string;
  status?: string;
  bankAccount?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateForecastData {
  date: Date;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  bankAccount: string;
  status?: string;
}

export interface UpdateForecastData extends Partial<Forecast> {}
// CHEQUE MODULE
// ============================================================================

export interface Cheque {
  bankAccount: Types.ObjectId | string;
  chequeNumber: string;
  payeeName: string;
  amount: number;
  chequeDate: Date;
  orientation?: string;
  printStatus?: string;
  transactionStatus?: string;
}

export interface ChequeDocument extends Cheque, Document {}

export interface ChequeQuery extends BaseQuery {
  bankAccount?: string;
  printStatus?: string;
  transactionStatus?: string;
  orientation?: string;
}

export interface CreateChequeData extends Partial<Cheque> {
  bankAccount: Types.ObjectId | string;
  payeeName: string;
  amount: number;
  chequeDate: Date;
}

export interface UpdateChequeData {
  printStatus?: string;
  transactionStatus?: string;
}
export interface UpdateBankAccountData extends Partial<BankAccount> {}

// ============================================================================
// PAYEE MODULE
// ============================================================================

export interface Payee {
  name: string;
  company?: string;
  category: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface PayeeDocument extends Payee, Document {}

export interface PayeeQuery extends BaseQuery {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  category?: string;
}

export interface CreatePayeeData extends Partial<Payee> {}
export interface UpdatePayeeData extends Partial<Payee> {}
