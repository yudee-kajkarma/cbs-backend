import { Schema, Connection } from 'mongoose';
import { getTenantModel } from '../utils/tenant-context';

// Import all schemas
import { userSchema } from './user.model';
import { employeeSchema } from './employee.model';
import { licenseSchema } from './license.model';
import { hardwareTransferSchema } from './hardwareTransfer.model';
import { ISOSchema } from './iso.model';
import { networkEquipmentSchema } from './network-equipment.model';
import { supportSchema } from './support.model';
import { NewHardwareSchema } from './newhardware.model';
import { FurnitureSchema } from './furniture.model';
import { legalDocSchema } from './legal-docs.model';
import { auditSchema } from './audit.model';
import { simSchema } from './sim.model';
import { softwareSchema } from './software.model';
import { PropertySchema } from './property.model';
import { vehicleSchema } from './vehicle.model';
import { EquipmentSchema } from './equipment.model';
import { bankAccountSchema } from './bankAccount.model';
import { telexTransferSchema } from './telexTransfer.model';
import { forecastSchema } from './forecast.model';
import { chequeSchema } from './cheque.model';
import { payeeSchema } from './payee.model';
import { leavePolicySchema } from './leavePolicy.model';
import { leaveBalanceSchema } from './leaveBalance.model';
import { leaveApplicationSchema } from './leaveApplication.model';
import { attendancePolicySchema } from './attendancePolicy.model';
import { metadataSchema } from './metadata.model';
import { payrollCompensationSchema } from './payrollCompensation.model';
import { attendanceSchema } from './attendance.model';
import { monthlyPayrollSchema } from './monthlyPayroll.model';
import { employeeBonusSchema } from './employeeBonus.model';
import { employeeIncentiveSchema } from './employeeIncentive.model';
import { roleSchema } from './role.model';
import { activityLogSchema } from './activity-log.model';

export type ModelDefinition = {
  name: string;
  schema: Schema;
  collectionName: string;
};

// ============================================================================
// TENANT-AWARE MODEL PROXY CREATION
// ============================================================================
/**
 * Create tenant-aware model proxy
 * This proxy intercepts all Mongoose model operations and routes them to the correct tenant database
 */
function createTenantAwareModelProxy<T>(modelName: string, schema: Schema, collectionName: string): any {
  const dummy = function () {} as any;

  return new Proxy(dummy, {
    get(_target, prop) {
      const model = getTenantModel<T>(modelName, schema, collectionName);
      const value = (model as any)[prop];
      
      // Bind functions to the model context
      if (typeof value === 'function') {
        return value.bind(model);
      }
      
      return value;
    },
    apply(_target, _thisArg, argArray) {
      const model = getTenantModel<T>(modelName, schema, collectionName);
      return (model as any).apply(_thisArg, argArray);
    },
    construct(_target, argArray) {
      const model = getTenantModel<T>(modelName, schema, collectionName);
      return new (model as any)(...argArray);
    },
  });
}

// ============================================================================
// MODEL DEFINITIONS - SINGLE SOURCE OF TRUTH
// ============================================================================
/**
 * Add new models here and they will automatically be:
 * 1. Registered in tenant connections (for populate)
 * 2. Available as tenant-aware proxy models
 *
 * To add a new model:
 * 1. Add it to the modelDefinitions array below
 * 2. Import the schema and document type at the top
 * 3. Export the model in the MODEL REGISTRY section below
 */
export const modelDefinitions: readonly ModelDefinition[] = [
  { name: 'User', schema: userSchema, collectionName: 'users' },
  { name: 'Employee', schema: employeeSchema, collectionName: 'employees' },
  { name: 'License', schema: licenseSchema, collectionName: 'licenses' },
  { name: 'HardwareTransfer', schema: hardwareTransferSchema, collectionName: 'hardwaretransfers' },
  { name: 'ISO', schema: ISOSchema, collectionName: 'isos' },
  { name: 'NetworkEquipment', schema: networkEquipmentSchema, collectionName: 'networkequipments' },
  { name: 'Support', schema: supportSchema, collectionName: 'supports' },
  { name: 'NewHardware', schema: NewHardwareSchema, collectionName: 'newhardwares' },
  { name: 'Furniture', schema: FurnitureSchema, collectionName: 'furnitures' },
  { name: 'LegalDoc', schema: legalDocSchema, collectionName: 'legaldocs' },
  { name: 'Audit', schema: auditSchema, collectionName: 'audits' },
  { name: 'Sim', schema: simSchema, collectionName: 'sims' },
  { name: 'Software', schema: softwareSchema, collectionName: 'softwares' },
  { name: 'Property', schema: PropertySchema, collectionName: 'properties' },
  { name: 'Vehicle', schema: vehicleSchema, collectionName: 'vehicles' },
  { name: 'Equipment', schema: EquipmentSchema, collectionName: 'equipments' },
  { name: 'BankAccount', schema: bankAccountSchema, collectionName: 'bankaccounts' },
  { name: 'TelexTransfer', schema: telexTransferSchema, collectionName: 'telextransfers' },
  { name: 'Forecast', schema: forecastSchema, collectionName: 'forecasts' },
  { name: 'Cheque', schema: chequeSchema, collectionName: 'cheques' },
  { name: 'Payee', schema: payeeSchema, collectionName: 'payees' },
  { name: 'LeavePolicy', schema: leavePolicySchema, collectionName: 'leavepolicies' },
  { name: 'LeaveBalance', schema: leaveBalanceSchema, collectionName: 'leavebalances' },
  { name: 'LeaveApplication', schema: leaveApplicationSchema, collectionName: 'leaveapplications' },
  { name: 'AttendancePolicy', schema: attendancePolicySchema, collectionName: 'attendancepolicies' },
  { name: 'Metadata', schema: metadataSchema, collectionName: 'metadata' },
  { name: 'PayrollCompensation', schema: payrollCompensationSchema, collectionName: 'payrollcompensations' },
  { name: 'Attendance', schema: attendanceSchema, collectionName: 'attendances' },
  { name: 'MonthlyPayroll', schema: monthlyPayrollSchema, collectionName: 'monthlypayrolls' },
  { name: 'EmployeeBonus', schema: employeeBonusSchema, collectionName: 'employeebonuses' },
  { name: 'EmployeeIncentive', schema: employeeIncentiveSchema, collectionName: 'employeeincentives' },
  { name: 'Role', schema: roleSchema, collectionName: 'roles' },
  { name: 'ActivityLog', schema: activityLogSchema, collectionName: 'activitylogs' },
] as const;

// ============================================================================
// MODEL REGISTRY - Auto-generated from modelDefinitions
// ============================================================================
export const modelRegistry = modelDefinitions.reduce(
  (registry, definition) => {
    registry[definition.name] = createTenantAwareModelProxy(
      definition.name,
      definition.schema,
      definition.collectionName
    );
    return registry;
  },
  {} as Record<string, any>
);

// ============================================================================
// MODEL BOOTSTRAPPING FUNCTION
// ============================================================================
/**
 * Bootstrap all models into a tenant connection
 * This ensures that all schemas are registered for populate operations
 */
export const bootstrapModelsForTenant = (connection: Connection): void => {
  try {
    modelDefinitions.forEach(({ name, schema, collectionName }) => {
      // Register the model with the tenant connection using explicit collection name
      if (!connection.models[name]) {
        connection.model(name, schema, collectionName);
      }
    });

    console.log(`✓ Bootstrapped ${modelDefinitions.length} models for tenant connection`);
  } catch (error) {
    console.error('Error bootstrapping models for tenant connection:', error);
    throw error;
  }
};

// ============================================================================
// TENANT-AWARE PROXY MODELS
// ============================================================================
// These models automatically use the correct tenant database based on request context
// Usage: import { User, Employee } from '../models';
//        await User.find(); // Automatically scoped to current tenant

export const User = modelRegistry.User;
export const Employee = modelRegistry.Employee;
export const License = modelRegistry.License;
export const HardwareTransfer = modelRegistry.HardwareTransfer;
export const Iso = modelRegistry.ISO;
export const NetworkEquipment = modelRegistry.NetworkEquipment;
export const Support = modelRegistry.Support;
export const NewHardware = modelRegistry.NewHardware;
export const Furniture = modelRegistry.Furniture;
export const LegalDocs = modelRegistry.LegalDoc;
export const Audit = modelRegistry.Audit;
export const Sim = modelRegistry.Sim;
export const Software = modelRegistry.Software;
export const Property = modelRegistry.Property;
export const Vehicle = modelRegistry.Vehicle;
export const Equipment = modelRegistry.Equipment;
export const BankAccount = modelRegistry.BankAccount;
export const TelexTransfer = modelRegistry.TelexTransfer;
export const Forecast = modelRegistry.Forecast;
export const Cheque = modelRegistry.Cheque;
export const Payee = modelRegistry.Payee;
export const LeavePolicy = modelRegistry.LeavePolicy;
export const LeaveBalance = modelRegistry.LeaveBalance;
export const LeaveApplication = modelRegistry.LeaveApplication;
export const AttendancePolicy = modelRegistry.AttendancePolicy;
export const Metadata = modelRegistry.Metadata;
export const PayrollCompensation = modelRegistry.PayrollCompensation;
export const Attendance = modelRegistry.Attendance;
export const MonthlyPayroll = modelRegistry.MonthlyPayroll;
export const EmployeeBonus = modelRegistry.EmployeeBonus;
export const EmployeeIncentive = modelRegistry.EmployeeIncentive;
export const Role = modelRegistry.Role;
export const ActivityLog = modelRegistry.ActivityLog;

// ============================================================================
// EXPORT SCHEMAS FOR REFERENCE
// ============================================================================
export {
  userSchema,
  employeeSchema,
  licenseSchema,
  hardwareTransferSchema,
  ISOSchema,
  networkEquipmentSchema,
  supportSchema,
  NewHardwareSchema,
  FurnitureSchema,
  legalDocSchema,
  auditSchema,
  simSchema,
  softwareSchema,
  PropertySchema,
  vehicleSchema,
  EquipmentSchema,
  bankAccountSchema,
  telexTransferSchema,
  forecastSchema,
  chequeSchema,
  payeeSchema,
  leavePolicySchema,
  leaveBalanceSchema,
  leaveApplicationSchema,
  attendancePolicySchema,
  metadataSchema,
  payrollCompensationSchema,
  attendanceSchema,
  monthlyPayrollSchema,
  employeeBonusSchema,
  employeeIncentiveSchema,
  roleSchema,
  activityLogSchema,
};
