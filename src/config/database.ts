import mongoose from 'mongoose';
import { config } from '../config/config';
import { closeAllTenantConnections } from '../utils/tenant-context';

/**
 * Connect to MongoDB (base connection for admin/shared operations)
 * In multi-tenant architecture, this is primarily for system-level operations
 * Individual tenant connections are managed by tenant middleware
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    // Connect to base MongoDB server (admin database)
    const baseUri = config.mongodb.uri.replace(/\/[^\/]*$/, '');
    await mongoose.connect(`${baseUri}/admin`);
    console.log('Connected to MongoDB (base connection)');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

/**
 * Graceful shutdown - Close all tenant connections
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    // Close all tenant connections
    await closeAllTenantConnections();
    
    // Close base connection
    await mongoose.connection.close();
    
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};

