import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { AdminConnectionUtil } from '../src/utils/admin-connection';
import { ReferenceGenerator } from '../src/utils/reference-generator.util';

dotenv.config();

async function createSuperAdminUser(): Promise<void> {
  try {
    // Get IdentityUser model from admin database
    const IdentityUserModel = await AdminConnectionUtil.getIdentityUserModel();

    // Check if superadmin already exists by username or email
    const existingSuperAdmin = await IdentityUserModel.findOne({
      $or: [
        { username: 'superadmin' },
        { email: 'admin@company.com' }
      ]
    });

    if (existingSuperAdmin) {
      console.log('SUPER_ADMIN user already exists:');
      console.log('Username:', existingSuperAdmin.username);
      console.log('Email:', existingSuperAdmin.email);
      console.log('UserRefId:', existingSuperAdmin.userRefId);
      process.exit(0);
    }

    // Generate userRefId
    const userRefId = ReferenceGenerator.generateUserRefIdManual();

    // Hash password (using default password or provided hash)
    // Default password: 'superadmin123456'
    const plainPassword = process.env.SUPERADMIN_PASSWORD || 'superadmin123456';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create superadmin user in identity database
    const superAdminData = {
      userRefId,
      tenantRefId: 'SYSTEM',
      username: 'superadmin',
      email: 'admin@company.com',
      password: hashedPassword,
      isActive: true,
      lastLoginAt: null,
    };

    const superAdminUser = await IdentityUserModel.create(superAdminData);

    console.log('SUPER_ADMIN user created successfully:');
    console.log('UserRefId:', superAdminUser.userRefId);
    console.log('TenantRefId:', superAdminUser.tenantRefId);
    console.log('Username:', superAdminUser.username);
    console.log('Email:', superAdminUser.email);
    console.log('IsActive:', superAdminUser.isActive);
    console.log('\nIMPORTANT: Change the default password in production!');
  } catch (error) {
    console.error('Error creating SUPER_ADMIN user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    // Close admin database connection
    await AdminConnectionUtil.closeAdminConnection();
  }
}

createSuperAdminUser();
