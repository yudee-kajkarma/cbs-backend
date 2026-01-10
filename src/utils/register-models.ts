import { Connection } from 'mongoose';
import { bootstrapModelsForTenant } from '../models';

/**
 * Register all models on a tenant connection for populate() support
 * This ensures that referenced models are available when using populate
 * 
 * @param connection - The tenant-specific MongoDB connection
 */
export function registerAllModelsOnConnection(connection: Connection): void {
  bootstrapModelsForTenant(connection);
}

