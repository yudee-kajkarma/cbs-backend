import { AsyncLocalStorage } from 'async_hooks';
import mongoose, { Model, Schema, Connection } from 'mongoose';

// Define the tenant context structure
interface TenantContext {
    tenantId: string;
    tenantDbName: string;
    connection: mongoose.Connection;
    models: Map<string, Model<any>>;
}

// Create AsyncLocalStorage instance
const asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

// Store active connections globally
const activeConnections = new Map<string, mongoose.Connection>();

// Cache per-tenant compiled models (keyed by tenantDbName to avoid numeric connection ids)
const tenantModelsCache = new Map<string, Map<string, Model<any>>>();

/**
 * Set tenant context for the current request
 */
export function setTenantContext(
    tenantId: string,
    tenantDbName: string,
    connection: mongoose.Connection,
    fn: () => void
): void {
    // Reuse per-tenant model cache
    if (!tenantModelsCache.has(tenantDbName)) {
        tenantModelsCache.set(tenantDbName, new Map<string, Model<any>>());
    }

    const models = tenantModelsCache.get(tenantDbName)!;

    const context: TenantContext = {
        tenantId,
        tenantDbName,
        connection,
        models,
    };

    asyncLocalStorage.run(context, fn);
}

/**
 * Get tenant context for the current request
 */
export function getTenantContext(): TenantContext {
    const context = asyncLocalStorage.getStore();
    if (!context) {
        throw new Error('No tenant context available. Make sure tenant middleware is applied.');
    }
    return context;
}

/**
 * Get or create a model for the current tenant
 * @param modelName - The model name (used for model registration)
 * @param schema - The Mongoose schema
 * @param collectionName - The explicit collection name
 */
export function getTenantModel<T>(modelName: string, schema: Schema, collectionName: string): Model<T> {
    const context = getTenantContext();

    // Return cached model if exists
    if (context.models.has(modelName)) {
        return context.models.get(modelName) as Model<T>;
    }

    // Create new model with explicit collection name and cache it
    const model = context.connection.model<T>(modelName, schema, collectionName);
    context.models.set(modelName, model);

    return model;
}

/**
 * Add connection to active connections
 */
export function addActiveConnection(tenantDbName: string, connection: mongoose.Connection): void {
    activeConnections.set(tenantDbName, connection);
}

/**
 * Get connection by tenant database name
 */
export function getConnectionByTenantDbName(tenantDbName: string): mongoose.Connection | undefined {
    return activeConnections.get(tenantDbName);
}

/**
 * Get all active connections (for cleanup/monitoring)
 */
export function getAllActiveConnections(): Map<string, mongoose.Connection> {
    return activeConnections;
}

/**
 * Close connection for a specific tenant
 */
export async function closeTenantConnection(tenantDbName: string): Promise<void> {
    const connection = activeConnections.get(tenantDbName);
    if (connection) {
        await connection.close();
        activeConnections.delete(tenantDbName);
        tenantModelsCache.delete(tenantDbName);
    }
}

/**
 * Close all tenant connections
 */
export async function closeAllTenantConnections(): Promise<void> {
    const closePromises = Array.from(activeConnections.values()).map((conn) => conn.close());
    await Promise.all(closePromises);
    activeConnections.clear();
    tenantModelsCache.clear();
}
