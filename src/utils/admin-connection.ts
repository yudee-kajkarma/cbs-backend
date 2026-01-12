import mongoose from 'mongoose';
import { config } from '../config/config';
import { tenantSchema } from '../models/tenant.model';
import { identityUserSchema } from '../models/identity-user.model';
import { TenantDocument } from '../interfaces/model.interface';
import { IdentityUserDocument } from '../interfaces';

/**
 * Admin Connection Utility
 * Manages connection to CBS_Admin database for tenant management and user authentication
 * This is separate from tenant-specific databases
 */
export class AdminConnectionUtil {
  private static adminConnection: mongoose.Connection | null = null;
  private static TenantModel: mongoose.Model<TenantDocument> | null = null;
  private static IdentityUserModel: mongoose.Model<IdentityUserDocument> | null = null;

  /**
   * Get or create admin database connection
   * @returns Admin database connection
   */
  static async getAdminConnection(): Promise<mongoose.Connection> {
    if (this.adminConnection && this.adminConnection.readyState === 1) {
      return this.adminConnection;
    }

    try {
      const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
      const adminDbUri = `${baseUri}/CBS_Admin`;

      this.adminConnection = await mongoose.createConnection(adminDbUri);

      return this.adminConnection;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Tenant model from admin database
   * @returns Tenant model instance
   */
  static async getTenantModel(): Promise<mongoose.Model<TenantDocument>> {
    if (this.TenantModel) {
      return this.TenantModel;
    }

    const connection = await this.getAdminConnection();
    this.TenantModel = connection.model<TenantDocument>('Tenant', tenantSchema, 'tenants');

    return this.TenantModel;
  }

  /**
   * Get IdentityUser model from admin database
   * @returns IdentityUser model instance
   */
  static async getIdentityUserModel(): Promise<mongoose.Model<IdentityUserDocument>> {
    if (this.IdentityUserModel) {
      return this.IdentityUserModel;
    }

    const connection = await this.getAdminConnection();
    this.IdentityUserModel = connection.model<IdentityUserDocument>(
      'IdentityUser',
      identityUserSchema,
      'users'
    );

    return this.IdentityUserModel;
  }

  /**
   * Close admin database connection
   */
  static async closeAdminConnection(): Promise<void> {
    if (this.adminConnection) {
      await this.adminConnection.close();
      this.adminConnection = null;
      this.TenantModel = null;
      this.IdentityUserModel = null;
    }
  }
}

// Export convenience functions for backward compatibility
export const getAdminConnection = () => AdminConnectionUtil.getAdminConnection();
export const getTenantModel = () => AdminConnectionUtil.getTenantModel();
export const getIdentityUserModel = () => AdminConnectionUtil.getIdentityUserModel();
export const closeAdminConnection = () => AdminConnectionUtil.closeAdminConnection();
