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
import { UserRole, CommonStatus, EmployeeStatus } from '../constants';

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
  depreciationCost?: number;
  maintenanceValue?: number;
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
  address?: string;
  fileKey?: string;
  type?: string;
  currentBalance?: number;
  finalBalance?: number;
  displayCurrency?: string;
  status?: string;
}

export interface BankAccountDocument extends BankAccount, Document {}

export interface BankAccountQuery extends BaseQuery {
  bankName?: string;
  branch?: string;
  accountHolder?: string;
  accountNumber?: string;
  type?: string;
  status?: string;
  currency?: string;
}

export interface CreateBankAccountData extends Partial<BankAccount> {}
export interface UpdateBankAccountData extends Partial<BankAccount> {}

// ============================================================================
// TELEX TRANSFER MODULE
// ============================================================================

export interface TelexTransfer {
  referenceNo?: string;
  transferDate: Date;
  senderBank: string;
  senderAccountNo: string;
  beneficiaryName: string;
  beneficiaryBankName: string;
  beneficiaryAccountNo: string;
  swiftCode: string;
  transferAmount: number;
  currency: string;
  purpose: string;
  remarks?: string;
  authorizedBy: string;
  status?: string;
}

export interface TelexTransferQuery extends BaseQuery {}

export interface CreateTelexTransferData extends Partial<TelexTransfer> {}
export interface UpdateTelexTransferData extends Partial<TelexTransfer> {}

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

// IDENTITY USER MODULE (identity_db - Authentication)

export interface IdentityUser {
  userRefId: string;
  tenantRefId: string; // Links to tenant this user belongs to
  username: string; // Globally unique across all tenants
  email: string; // Globally unique across all tenants
  password: string; // Hashed password
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface IdentityUserDocument extends IdentityUser, Document {}

// USER MODULE (CBS_{tenantRefId})

export interface User {
  userId?: string; // Business reference ID (e.g., "UA170502341234")
  userRefId: string; // Links to IdentityUser in identity_db
  tenantRefId: string; // Reference to tenant this user belongs to
  fullName: string;
  email: string;
  role: UserRole;
  roles: Types.ObjectId[]; // Array of Role IDs for granular permissions (USER role)
}

export interface UserDocument extends User, Document {}

export interface UserQuery extends BaseQuery {
  role?: string;
  email?: string;
  username?: string;
}

export interface CreateUserData {
  username: string; 
  email: string;
  password: string; 
  fullName: string; 
  role: string;
  roles?: Types.ObjectId[]; 
}

export interface UpdateUserData extends Partial<User> {
  username?: string; 
  email?: string;
  password?: string; 
}

// Employee Interfaces
export interface EmployeeDocument {
  fileKey?: string;
  expiryDate?: Date;
}

export interface Employee {
  employeeId?: string;
  userId: Types.ObjectId | string;
  position?: string;
  department?: string;
  phoneNumber?: string;
  joinDate?: Date;
  salary?: number;
  status: EmployeeStatus;
  documents?: EmployeeDocument[];
}

export interface EmployeeMongoDocument extends Employee, Document {}

/**
 * Populated employee with user data (after .populate('userId'))
 */
export interface PopulatedEmployee extends Omit<Employee, 'userId'> {
  _id: string;
  userId: Pick<User, 'fullName'>; 
}

export interface EmployeeQuery extends BaseQuery {
  department?: string;
  status?: string;
  position?: string;
}

export interface CreateEmployeeData extends Partial<Employee> {}
export interface UpdateEmployeeData extends Partial<Employee> {}
export interface UpdateUserData extends Partial<User> {}

// ============================================================================
// LEAVE POLICY MODULE
// ============================================================================

export interface LeavePolicy {
  annualLeavePaid: number;
  sickLeavePaid: number;
  emergencyLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  unpaidLeaveMax: number;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  allowNegativeBalance: boolean;
  maxNegativeLeaveDays: number;
  isActive: boolean;
}

export interface LeavePolicyDocument extends LeavePolicy, Document {}

export interface LeavePolicyQuery extends BaseQuery {
  isActive?: boolean;
}

export interface CreateLeavePolicyData extends Partial<LeavePolicy> {}
export interface UpdateLeavePolicyData extends Partial<LeavePolicy> {}

// ============================================================================
// ATTENDANCE POLICY MODULE
// ============================================================================

export interface AttendancePolicy {
  standardHoursPerDay: number;
  workingDaysPerWeek: number;
  overtimeRateMultiplier: number;
  lateArrivalGracePeriod: number;
  attendanceBonusThreshold: number;
  hoursConcessionPercentage: number;
  shortfallDeductionPercentage: number;
  isActive: boolean;
}

export interface AttendancePolicyDocument extends AttendancePolicy, Document {}

export interface UpdateAttendancePolicyData extends Partial<AttendancePolicy> {}

// ============================================================================
// METADATA MODULE
// ============================================================================

export interface Metadata {
  standardWorkStartTime: string;
  halfDayHoursThreshold: number;
  autoCheckoutTime: string;
  timeZone: string;
  allowTimeZone: boolean;
  companyNetworkIpRanges: string[];
  isActive: boolean;
  companyIpRanges: string[]; // Array of CIDR IP ranges
}

export interface MetadataDocument extends Metadata, Document {}

export interface UpdateMetadataData extends Partial<Metadata> {}

// ============================================================================
// PAYROLL COMPENSATION MODULE
// ============================================================================

export interface PayrollCompensation {
  socialInsuranceRate: number;
  payrollProcessingDay: number;
  currency: string;
  paymentMethod: string;
  attendanceBonusAmount: number;
  isActive: boolean;
}

export interface PayrollCompensationDocument extends PayrollCompensation, Document {}

export interface PayrollCompensationQuery extends BaseQuery {
  isActive?: boolean;
}

export interface UpdatePayrollCompensationData extends Partial<PayrollCompensation> {}

// ============================================================================
// LEAVE APPLICATION MODULE
// ============================================================================

export interface LeaveApplication {
  requestId: string;
  employeeId: Types.ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: string;
  appliedOn: Date;
  approvedBy?: Types.ObjectId;
  actionDate?: Date;
  rejectionReason?: string;
}

export interface LeaveApplicationDocument extends LeaveApplication, Document {}

export interface LeaveApplicationQuery extends BaseQuery {
  status?: string;
  leaveType?: string;
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateLeaveApplicationData extends Partial<LeaveApplication> {}
export interface UpdateLeaveApplicationData extends Partial<LeaveApplication> {}

// ============================================================================
// LEAVE BALANCE MODULE
// ============================================================================

export interface LeaveBalanceItem {
  totalAllocation: number;
  used: number;
  remaining: number;
}

export interface UnpaidLeaveBalanceItem {
  totalAllowed: number;
  used: number;
  remaining: number;
}

export interface LeaveBalance {
  employeeId: Types.ObjectId;
  year: number;
  annualLeave: LeaveBalanceItem;
  sickLeave: LeaveBalanceItem;
  emergencyLeave: LeaveBalanceItem;
  unpaidLeave: UnpaidLeaveBalanceItem;
}

export interface LeaveBalanceDocument extends LeaveBalance, Document {}

export interface LeaveBalanceQuery extends BaseQuery {
  employeeId?: string;
  year?: number;
}

export interface CreateLeaveBalanceData extends Partial<LeaveBalance> {}
export interface UpdateLeaveBalanceData extends Partial<LeaveBalance> {}

// ============================================================================
// ATTENDANCE MODULE
// ============================================================================

export interface Attendance {
  attendanceId?: string;
  employeeId: Types.ObjectId;
  date: Date;
  checkInTime: Date;
  checkInIP: string;
  checkInLocation?: {
    latitude?: number;
    longitude?: number;
  };
  checkInTimeZone?: string;
  checkOutTime?: Date;
  checkOutIP?: string;
  checkOutLocation?: {
    latitude?: number;
    longitude?: number;
  };
  checkOutTimeZone?: string;
  workingHours: number;
  overtimeHours: number;
  isLateArrival: boolean;
  lateArrivalMinutes: number;
  status: string;
}

export interface AttendanceDocument extends Attendance, Document {}

export interface CreateAttendanceData extends Partial<Attendance> {
  employeeId: Types.ObjectId;
  checkInTime: Date;
  checkInIP: string;
}

export interface UpdateAttendanceData extends Partial<Attendance> {}

export interface AttendanceQuery extends BaseQuery {
  employeeId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  department?: string;
  month?: number;
  year?: number;
}

export interface MonthlyStatistics {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  averageWorkingHours: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
}

export interface LiveAttendanceSummary {
  totalStaff: number;
  checkedIn: number;
  checkedOut: number;
  notMarked: number;
  onLeave: number;
  presentPercentage: number;
}

export interface DailySalarySummary {
  present: number;
  absent: number;
  onLeave: number;
  attendancePercent: number;
}

export interface SalaryCalculationRules {
  fullSalary: {
    condition: string;
    threshold: number;
    percentage: number;
  };
  deducted: {
    condition: string;
    threshold: number;
    percentage: number;
  };
  zeroSalary: {
    condition: string;
  };
}

export interface DailyAttendanceRecord {
  empId: string;
  name: string;
  department?: string;
  position?: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: string;
  salaryStatus: string;
  deductionAmount: number;
  salaryForDay: number;
  timeZone: string;
}

export interface DailyAttendanceSummaryResponse {
  summary: DailySalarySummary;
  salaryRules: SalaryCalculationRules;
  records: DailyAttendanceRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    date: string;
    status: string | null;
    department: string | null;
  };
}

export interface EmployeeComplianceRecord {
  employeeId: string;
  fullName: string;
  department: string;
  presentDays: number;
  requiredDays: number;
  attendancePercentage: number;
  thresholdMet: boolean;
}

// ============================================================================
// MONTHLY PAYROLL MODULE
// ============================================================================

export interface MonthlyPayroll {
  payrollId: string;
  employeeId: Types.ObjectId;
  month: number;
  year: number;
  totalSalary: number;
  basicSalary: number;
  attendancePercentage: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  unpaidLeaveDays: number;
  paidLeaveDays: number;
  salaryDeduction: number;
  socialInsurance: number;
  totalDeductions: number;
  bonusAmount: number;
  incentiveAmount: number;
  overtimePay: number;
  netSalary: number;
  status: string;
  processedDate?: Date;
  paidDate?: Date;
}

export interface MonthlyPayrollDocument extends MonthlyPayroll, Document {}

export interface MonthlyPayrollQuery extends BaseQuery {
  employeeId?: string;
  month?: number;
  year?: number;
  status?: string;
  department?: string;
}

export interface CreateMonthlyPayrollData extends Partial<MonthlyPayroll> {
  employeeId: Types.ObjectId;
  month: number;
  year: number;
}

export interface UpdateMonthlyPayrollData extends Partial<MonthlyPayroll> {}

// ============================================================================
// EMPLOYEE BONUS MODULE
// ============================================================================

export interface EmployeeBonus {
  bonusId: string;
  employeeId: Types.ObjectId;
  amount: number;
  month: number;
  year: number;
}

export interface EmployeeBonusDocument extends EmployeeBonus, Document {}

export interface EmployeeBonusQuery extends BaseQuery {
  employeeId?: string;
  month?: number;
  year?: number;
  department?: string;
}

export interface CreateEmployeeBonusData extends Partial<EmployeeBonus> {
  employeeId: Types.ObjectId;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateEmployeeBonusData extends Partial<EmployeeBonus> {}

// ============================================================================
// EMPLOYEE INCENTIVE MODULE
// ============================================================================

export interface EmployeeIncentive {
  incentiveId: string;
  employeeId: Types.ObjectId;
  amount: number;
  month: number;
  year: number;
}

export interface EmployeeIncentiveDocument extends EmployeeIncentive, Document {}

export interface EmployeeIncentiveQuery extends BaseQuery {
  employeeId?: string;
  month?: number;
  year?: number;
  department?: string;
}

export interface CreateEmployeeIncentiveData extends Partial<EmployeeIncentive> {
  employeeId: Types.ObjectId;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateEmployeeIncentiveData extends Partial<EmployeeIncentive> {}

// ============================================================================
// ACTIVITY LOG MODULE
// ============================================================================

export interface ActivityLog {
  userId: Types.ObjectId;
  employeeId?: Types.ObjectId;
  activityType: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: Types.ObjectId;
  description: string;
  metadata?: Record<string, any>;
}

export interface ActivityLogDocument extends ActivityLog, Document {}

export interface ActivityLogQuery extends BaseQuery {
  userId?: string;
  employeeId?: string;
  activityType?: string;
  module?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateActivityLogData {
  userId: Types.ObjectId | string;
  employeeId?: Types.ObjectId | string;
  activityType: string;
  action: string;
  module: string;
  description: string;
  entityType?: string;
  entityId?: Types.ObjectId | string;
  metadata?: Record<string, any>;
}

// ============================================================================
// ANALYTICS MODULE
// ============================================================================

export interface ITOverviewAnalytics {
  totalAssets: number;
  modules: {
    hardware: HardwareModuleStats;
    software: SoftwareModuleStats;
    networkEquipment: NetworkModuleStats;
    support: SupportModuleStats;
    sim: SimModuleStats;
    hardwareTransfers: TransferModuleStats;
  };
}

export interface HardwareModuleStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SoftwareModuleStats {
  total: number;
  active: number;
  expired: number;
}

export interface NetworkModuleStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
}

export interface SupportModuleStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface SimModuleStats {
  total: number;
  active: number;
  inactive: number;
}

export interface TransferModuleStats {
  total: number;
  active: number;
  completed: number;
}

export interface AssetsOverviewAnalytics {
  totalAssets: number;
  modules: {
    property: AssetModuleStats;
    vehicle: AssetModuleStats;
    equipment: AssetModuleStats;
    furniture: AssetModuleStats;
  };
}

export interface AssetModuleStats {
  total: number;
  active: number;
  inactive: number;
}

// ============================================================================
// COMPANY DOCUMENTS ANALYTICS
// ============================================================================

export interface CompanyDocsOverviewAnalytics {
  totalDocuments: number;
  modules: {
    legalDocs: CompanyDocModuleStats;
    audit: CompanyDocModuleStats;
    iso: CompanyDocModuleStats;
  };
}

export interface CompanyDocModuleStats {
  total: number;
}

// ============================================================================
// BANK ANALYTICS
// ============================================================================

export interface BankOverviewAnalytics {
  totalRecords: number;
  modules: {
    bankAccounts: BankAccountModuleStats;
    cheques: ChequeModuleStats;
    telexTransfers: TelexTransferModuleStats;
    forecasts: ForecastModuleStats;
  };
}

export interface BankAccountModuleStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ChequeModuleStats {
  total: number;
  printed: number;
  cleared: number;
  pending: number;
}

export interface TelexTransferModuleStats {
  total: number;
  completed: number;
  pending: number;
  draft: number;
}

export interface ForecastModuleStats {
  total: number;
  income: number;
  expense: number;
  planned: number;
  completed: number;
}

// ============================================================================
// TENANT MODULE (CBS_Admin)
// ============================================================================

export interface Tenant {
  tenantRefId: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  status: string;
  adminUsername?: string;        // Temporary - removed after provisioning
  adminPassword?: string;        // Temporary - removed after provisioning
  isProvisioned: boolean;        // True if DB and admin user created
}

export interface TenantDocument extends Tenant, Document {}

export interface TenantQuery extends BaseQuery {
  status?: string;
}

export interface CreateTenantData {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  username: string;
  password: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface UpdateTenantData {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  status?: string;
}
