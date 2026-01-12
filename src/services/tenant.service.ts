import mongoose from 'mongoose';
import { getTenantModel } from '../utils/admin-connection';
import { TenantStatus } from '../models/tenant.model';
import { TenantDocument, CreateTenantData, UpdateTenantData, TenantQuery } from '../interfaces/model.interface';
import { generateTenantRefId, getTenantDatabaseName } from '../utils/tenant.util';
import { throwError } from '../utils/errors.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { config } from '../config/config';
import * as bcrypt from 'bcryptjs';
import { userSchema } from '../models/user.model';
import { employeeSchema } from '../models/employee.model';
import { SYSTEM_ROLES } from '../constants/enums.constants';
import { getIdentityUserModel } from '../utils/admin-connection';
import { PaginationService } from './pagination.service';
import { ReferenceGenerator } from '../utils/reference-generator.util';
import { InfraService } from './infra.service';

/**
 * Tenant Service
 */
export class TenantService {
  /**
   * Create a new tenant
   */
  static async create(data: CreateTenantData): Promise<TenantDocument> {
    try {
      const TenantModel = await getTenantModel();

    const existingTenant = await TenantModel.findOne({ companyEmail: data.companyEmail });
    if (existingTenant) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_EXISTS);
    }

    // Generate unique tenant reference ID
    let tenantRefId = generateTenantRefId();
    let attempts = 0;
    while ((await TenantModel.findOne({ tenantRefId })) && attempts < 5) {
      tenantRefId = generateTenantRefId();
      attempts++;
    }

    if (attempts >= 5) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_ID_GENERATION_FAILED);
    }

    // Create tenant record with admin credentials (not provisioned yet)
    const tenant = await TenantModel.create({
      tenantRefId,
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      address: data.address,
      status: TenantStatus.PENDING,
      adminUsername: data.username,
      adminPassword: data.password, 
      isProvisioned: false,
    });

      return tenant;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'create', data });
    }
  }

  /**
   * Get tenant by ID
   */
  static async findById(tenantId: string): Promise<TenantDocument | null> {
    try {
      const TenantModel = await getTenantModel();
      return await TenantModel.findById(tenantId);
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'findById', tenantId });
    }
  }

  /**
   * Get tenant by reference ID
   */
  static async findByRefId(tenantRefId: string): Promise<TenantDocument | null> {
    try {
      const TenantModel = await getTenantModel();
      return await TenantModel.findOne({ tenantRefId });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'findByRefId', tenantRefId });
    }
  }

  /**
   * Get tenant by email
   */
  static async findByEmail(email: string): Promise<TenantDocument | null> {
    try {
      const TenantModel = await getTenantModel();
      return await TenantModel.findOne({ companyEmail: email });
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'findByEmail', email });
    }
  }

  /**
   * Get all tenants with filtering and pagination
   */
  static async findAll(query: TenantQuery = {}) {
    try {
      const TenantModel = await getTenantModel();

      const searchableFields = ['companyName', 'companyEmail', 'tenantRefId'];
      const allowedSortFields = ['companyName', 'companyEmail', 'tenantRefId', 'status', 'createdAt', 'updatedAt'];
      const filterFields = ['status'];

      const result = await PaginationService.paginate(TenantModel, query, {
        searchFields: searchableFields,
        allowedSortFields: allowedSortFields,
        filterFields: filterFields,
      });

      return {
        tenants: result.data,
        pagination: result.pagination,
        filters: result.filters,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'findAll', query });
    }
  }

  /**
   * Update tenant
   */
  static async update(tenantId: string, data: UpdateTenantData): Promise<TenantDocument | null> {
    try {
      const TenantModel = await getTenantModel();

    // Check if email is being updated and if it's already taken
    if (data.companyEmail) {
      const existingTenant = await TenantModel.findOne({
        companyEmail: data.companyEmail,
        _id: { $ne: tenantId },
      });

      if (existingTenant) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_EMAIL_IN_USE);
      }
    }

    const tenant = await TenantModel.findByIdAndUpdate(
      tenantId,
      { $set: data },
      { new: true, runValidators: true }
    );

      return tenant;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'update', tenantId, data });
    }
  }

  /**
   * Activate tenant and provision resources
   */
  static async activate(tenantId: string): Promise<TenantDocument | null> {
    try {
      const TenantModel = await getTenantModel();

    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND);
    }

    // Check if already provisioned
    if (tenant.isProvisioned) {
      tenant.status = TenantStatus.ACTIVE;
      await tenant.save();
      return tenant;
    }

    // Provision tenant resources (first-time activation) using atomic transaction
    const adminSession = await mongoose.startSession();
    let tenantConnection: mongoose.Connection | null = null;
    
    try {
      // Create admin user with database initialization
      if (!tenant.adminUsername || !tenant.adminPassword) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.MISSING_ADMIN_CREDENTIALS);
      }

      const adminData: CreateTenantData = {
        companyName: tenant.companyName,
        companyEmail: tenant.companyEmail,
        companyPhone: tenant.companyPhone,
        username: tenant.adminUsername,
        password: tenant.adminPassword,
        address: tenant.address,
      };

      // Start transaction on admin database
      adminSession.startTransaction();

      // Step 1: Create admin user and tenant database (atomic)
      tenantConnection = await this.createAdminUserAtomic(tenant.tenantRefId, adminData, adminSession);
      console.log(`✓ Tenant database provisioned for: ${tenant.tenantRefId}`);

      // Step 2: Provision S3 bucket for file storage
      // await InfraService.provisionS3ForTenant(tenant.tenantRefId);
      // console.log(`✓ S3 bucket provisioned for: ${tenant.tenantRefId}`);

      // Step 3: Update tenant status and remove credentials (within transaction)
      tenant.status = TenantStatus.ACTIVE;
      tenant.isProvisioned = true;
      tenant.adminUsername = undefined;
      tenant.adminPassword = undefined;
      await tenant.save({ session: adminSession });

      // Commit transaction
      await adminSession.commitTransaction();
      console.log(`✓ Tenant activation completed successfully for: ${tenant.tenantRefId}`);

      return tenant;
    } catch (provisionError) {
      // Rollback transaction on admin database
      await adminSession.abortTransaction();
      
      // Clean up tenant database if it was created
      if (tenantConnection) {
        try {
          const databaseName = getTenantDatabaseName(tenant.tenantRefId);
          await tenantConnection.dropDatabase();
          await tenantConnection.close();
          console.log(`✓ Rolled back tenant database: ${databaseName}`);
        } catch (cleanupError) {
          console.error('Failed to clean up tenant database during rollback:', cleanupError);
        }
      }

      // Log the actual error for debugging
      console.error('Tenant provisioning failed:', {
        tenantRefId: tenant.tenantRefId,
        error: provisionError instanceof Error ? provisionError.message : 'Unknown error',
        stack: provisionError instanceof Error ? provisionError.stack : undefined
      });
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_PROVISIONING_FAILED);
    } finally {
      adminSession.endSession();
      if (tenantConnection && tenantConnection.readyState === 1) {
        await tenantConnection.close();
      }
    }
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'activate', tenantId });
    }
  }

  /**
   * Suspend tenant
   */
  static async suspend(tenantId: string): Promise<TenantDocument | null> {
    try {
      const TenantModel = await getTenantModel();

      const tenant = await TenantModel.findByIdAndUpdate(
        tenantId,
        { $set: { status: TenantStatus.SUSPENDED } },
        { new: true }
      );

      return tenant;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'suspend', tenantId });
    }
  }

  /**
   * Permanently delete tenant (USE WITH CAUTION)
   */
  static async permanentlyDelete(tenantId: string): Promise<boolean> {
    try {
      const TenantModel = await getTenantModel();

      const tenant = await TenantModel.findById(tenantId);
      if (!tenant) {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.TENANT_NOT_FOUND);
      }

    // Step 1: Drop tenant database
    try {
      const databaseName = getTenantDatabaseName(tenant.tenantRefId);
      const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
      const tenantUri = `${baseUri}/${databaseName}`;
      const tenantConnection = await mongoose.createConnection(tenantUri);
      await tenantConnection.dropDatabase();
      await tenantConnection.close();
      console.log(`✓ Tenant database dropped: ${databaseName}`);
    } catch (error) {
      console.error(`Failed to drop tenant database:`, error);
    }

    // Step 2: Delete S3 bucket
    try {
      await InfraService.deleteS3ForTenant(tenant.tenantRefId);
      console.log(`✓ S3 bucket deleted for: ${tenant.tenantRefId}`);
    } catch (error) {
      console.error(`Failed to delete S3 bucket:`, error);
    }

      // Step 3: Delete tenant record from CBS_Admin
      await TenantModel.findByIdAndDelete(tenantId);

      return true;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'permanentlyDelete', tenantId });
    }
  }

  /**
   * Create admin user in tenant database (dual-write to CBS_Admin.users and tenant DB)
   * ATOMIC VERSION - Uses MongoDB transactions to ensure all-or-nothing creation
   */
  static async createAdminUserAtomic(tenantRefId: string, data: CreateTenantData, adminSession: mongoose.ClientSession): Promise<mongoose.Connection> {
    const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
    const databaseName = getTenantDatabaseName(tenantRefId);
    const tenantUri = `${baseUri}/${databaseName}`;

    // Step 1: Check if admin user already exists in CBS_Admin.users (idempotency)
    const IdentityUserModel = await getIdentityUserModel();
    let existingUser = await IdentityUserModel.findOne({ username: data.username, tenantRefId }).session(adminSession);
    
    let userRefId: string;
    
    if (existingUser) {
      throw new Error(`Admin user already exists for tenant ${tenantRefId}. Cannot recreate.`);
    }

    // Generate unique userRefId manually (first user in tenant)
    userRefId = ReferenceGenerator.generateUserRefIdManual();

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user in CBS_Admin.users (authentication) within transaction
    await IdentityUserModel.create([{
      userRefId,
      tenantRefId,
      username: data.username,
      email: data.companyEmail,
      password: hashedPassword,
      isActive: true,
    }], { session: adminSession });
    console.log(`✓ Created admin user in CBS_Admin for tenant ${tenantRefId}`);

    // Step 2: Create user in tenant database (business data)
    const tenantConnection = await mongoose.createConnection(tenantUri);

    try {
      // Create User and Employee models for this tenant
      const UserModel = tenantConnection.model('User', userSchema, 'users');
      const EmployeeModel = tenantConnection.model('Employee', employeeSchema, 'employees');

      // Generate unique userId manually (first user in tenant)
      const userId = ReferenceGenerator.generateUserIdManual(SYSTEM_ROLES.ADMIN);

      // Create admin user (business data only - no credentials)
      const adminUser = await UserModel.create({
        userId,
        userRefId, 
        tenantRefId,
        fullName: data.companyName,
        email: data.companyEmail,
        role: SYSTEM_ROLES.ADMIN,
        roles: [], 
      });

      // Generate unique employeeId manually (first employee in tenant)
      const employeeId = ReferenceGenerator.generateEmployeeIdManual();
      await EmployeeModel.create({
        employeeId,
        userId: adminUser._id,
        position: 'Administrator',
        department: 'Management',
        status: 'Active',
        joinDate: new Date(),
      });
      console.log(`✓ Created admin user and employee in tenant database ${tenantRefId}`);

      return tenantConnection;
    } catch (error) {
      // Clean up on error
      await tenantConnection.close();
      throw error;
    }
  }

  /**
   * Create admin user in tenant database (dual-write to CBS_Admin.users and tenant DB)
   * LEGACY VERSION - Kept for backward compatibility
   */
  static async createAdminUser(tenantRefId: string, data: CreateTenantData): Promise<void> {
    const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
    const databaseName = getTenantDatabaseName(tenantRefId);
    const tenantUri = `${baseUri}/${databaseName}`;

    // Step 1: Check if admin user already exists in CBS_Admin.users (idempotency)
    const IdentityUserModel = await getIdentityUserModel();
    let existingUser = await IdentityUserModel.findOne({ username: data.username, tenantRefId });
    
    let userRefId: string;
    
    if (existingUser) {
      // User already exists from previous failed activation attempt
      console.log(`ℹ Admin user already exists for tenant ${tenantRefId}, reusing: ${data.username}`);
      userRefId = existingUser.userRefId;
    } else {
      // Generate unique userRefId manually (first user in tenant)
      userRefId = ReferenceGenerator.generateUserRefIdManual();

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user in CBS_Admin.users (authentication)
      await IdentityUserModel.create({
        userRefId,
        tenantRefId,
        username: data.username,
        email: data.companyEmail,
        password: hashedPassword,
        isActive: true,
      });
      console.log(`✓ Created admin user in CBS_Admin for tenant ${tenantRefId}`);
    }

    // Step 2: Create user in tenant database (business data)
    const tenantConnection = await mongoose.createConnection(tenantUri);

    try {
      // Create User and Employee models for this tenant
      const UserModel = tenantConnection.model('User', userSchema, 'users');
      const EmployeeModel = tenantConnection.model('Employee', employeeSchema, 'employees');

      // Check if admin user already exists in tenant database
      const existingTenantUser = await UserModel.findOne({ userRefId });
      
      if (existingTenantUser) {
        console.log(`ℹ Admin user already exists in tenant database ${tenantRefId}, skipping creation`);
      } else {
        // Generate unique userId manually (first user in tenant)
        const userId = ReferenceGenerator.generateUserIdManual(SYSTEM_ROLES.ADMIN);

        // Create admin user (business data only - no credentials)
        const adminUser = await UserModel.create({
          userId,
          userRefId, 
          tenantRefId,
          fullName: data.companyName,
          email: data.companyEmail,
          role: SYSTEM_ROLES.ADMIN,
          roles: [], 
        });

        // Generate unique employeeId manually (first employee in tenant)
        const employeeId = ReferenceGenerator.generateEmployeeIdManual();
        await EmployeeModel.create({
          employeeId,
          userId: adminUser._id,
          position: 'Administrator',
          department: 'Management',
          status: 'Active',
          joinDate: new Date(),
        });
        console.log(`✓ Created admin user and employee in tenant database ${tenantRefId}`);
      }
    } finally {
      await tenantConnection.close();
    }
  }

  /**
   * Get tenant statistics
   */
  static async getStats() {
    try {
      const TenantModel = await getTenantModel();

      const [total, active, pending, suspended, inactive] = await Promise.all([
        TenantModel.countDocuments(),
        TenantModel.countDocuments({ status: TenantStatus.ACTIVE }),
        TenantModel.countDocuments({ status: TenantStatus.PENDING }),
        TenantModel.countDocuments({ status: TenantStatus.SUSPENDED }),
        TenantModel.countDocuments({ status: TenantStatus.INACTIVE }),
      ]);

      return {
        total,
        byStatus: {
          active,
          pending,
          suspended,
          inactive,
        },
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { serviceName: 'TenantService', method: 'getStats' });
    }
  }
}

