# Roles & Permissions in Multi-Tenant System

## Overview

This document explains how the role and permission system works in the multi-tenant architecture, maintaining the existing structure while adding tenant isolation.

---

## Current Role Structure

### System Roles (Hardcoded)

```typescript
enum UserRole {
  ADMIN = "ADMIN",   // Full access including settings
  HR = "HR",         // Full access except settings
  USER = "USER"     // Custom permissions via roles array
}
```

### Role Model Structure

```typescript
{
  name: string;                    // Role name (e.g., "Manager", "Viewer")
  description?: string;            // Role description
  permissions: {                   // Nested permissions object
    [module: string]: {            // Module name (e.g., "company_documents")
      [feature: string]: number    // Feature name -> permission value (0, 2, 4)
    }
  };
  isSystemRole: boolean;           // true for system roles, false for custom
  isActive: boolean;               // Soft delete flag
  createdBy?: ObjectId;           // User who created the role
  tenantRefId: string;            // ← ADDED for multi-tenant
}
```

### Permission Values

```typescript
PERMISSIONS = {
  NONE: 0,   // 0000 - No access
  READ: 2,   // 0010 - Read only
  WRITE: 4,  // 0100 - Write access
  // Full = READ | WRITE = 6 (read + write)
}
```

---

## Multi-Tenant Role Architecture

### Database Structure

```
┌─────────────────────────────────────────────────────────┐
│  Tenant 1 Database: CBS_tenant1                        │
│                                                         │
│  Role Collection:                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │ {                                                 │  │
│  │   _id: ObjectId("..."),                          │  │
│  │   name: "Manager",                                │  │
│  │   tenantRefId: "tenant1",                         │  │
│  │   permissions: {                                 │  │
│  │     company_documents: {                         │  │
│  │       license: 6,  // READ + WRITE                │  │
│  │       legal_docs: 6                               │  │
│  │     }                                             │  │
│  │   }                                               │  │
│  │ }                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  User Collection:                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │ {                                                 │  │
│  │   _id: ObjectId("..."),                          │  │
│  │   username: "john.doe",                          │  │
│  │   role: "USER",  // System role                  │  │
│  │   roles: [ObjectId("...")],  // Custom roles     │  │
│  │   tenantRefId: "tenant1"                          │  │
│  │ }                                                 │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Tenant 2 Database: CBS_tenant2                        │
│                                                         │
│  Role Collection:                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │ {                                                 │  │
│  │   _id: ObjectId("..."),                          │  │
│  │   name: "Manager",  // Same name, different DB  │  │
│  │   tenantRefId: "tenant2",                        │  │
│  │   permissions: {                                 │  │
│  │     company_documents: {                         │  │
│  │       license: 2,  // READ only (different!)    │  │
│  │       legal_docs: 6                               │  │
│  │     }                                             │  │
│  │   }                                               │  │
│  │ }                                                 │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Points

1. **Each tenant has its own Role collection**
2. **Roles are completely isolated per tenant**
3. **Same role name can exist in different tenants with different permissions**
4. **System roles (ADMIN/HR/USER) are determined by user.role field, not stored in Role collection**
5. **Custom roles are stored in Role collection and referenced in user.roles array**

---

## How Roles Work in Multi-Tenant

### System Roles (ADMIN, HR, USER)

System roles are **not stored in the Role collection**. They are:

1. **Stored in User.role field** (string: "ADMIN", "HR", "USER")
2. **Handled by middleware** for permission checking
3. **Same across all tenants** (ADMIN is always admin, HR is always HR)

```typescript
// User document
{
  _id: ObjectId("..."),
  username: "admin.user",
  role: "ADMIN",  // System role - not in Role collection
  roles: [],      // Custom roles array (empty for ADMIN/HR)
  tenantRefId: "tenant1"
}
```

### Custom Roles (for USER role)

Custom roles are **stored in the Role collection** and are:

1. **Tenant-specific** (each tenant has its own roles)
2. **Referenced in User.roles array** (array of Role ObjectIds)
3. **Used for USER role permissions** (ADMIN/HR don't use custom roles)

```typescript
// Role document (in tenant database)
{
  _id: ObjectId("role123"),
  name: "Document Manager",
  tenantRefId: "tenant1",
  permissions: {
    company_documents: {
      license: 6,      // READ + WRITE
      legal_docs: 6,
      audit: 2         // READ only
    }
  },
  isSystemRole: false,
  isActive: true
}

// User document
{
  _id: ObjectId("user123"),
  username: "john.doe",
  role: "USER",  // System role
  roles: [ObjectId("role123")],  // Custom role reference
  tenantRefId: "tenant1"
}
```

---

## Permission Resolution Flow

### Step 1: User Login

```typescript
// User logs in
POST /api/v1/auth/login
{
  username: "john.doe",
  password: "***"
}

// Auth service:
// 1. Find user by username (scoped to tenant via middleware)
// 2. Verify password
// 3. Get permissions based on user.role
```

### Step 2: Permission Calculation

```typescript
// In AuthService.generateUserToken()

// If user.role === "ADMIN"
permissions = PermissionManager.buildSystemRolePermissions("ADMIN");
// Returns: Full access to all modules including settings

// If user.role === "HR"
permissions = PermissionManager.buildSystemRolePermissions("HR");
// Returns: Full access to all modules except settings

// If user.role === "USER"
// Get permissions from custom roles
const userRoles = await RoleModel.find({
  _id: { $in: user.roles },
  isActive: true
});
permissions = PermissionManager.buildRolePermissions(
  userRoles.map(r => r.permissions)
);
// Returns: Merged permissions from all assigned custom roles
```

### Step 3: JWT Token Generation

```typescript
const payload = {
  userId: user._id.toString(),
  username: user.username,
  fullName: user.fullName,
  role: user.role,              // "ADMIN", "HR", or "USER"
  tenantRefId: user.tenantRefId, // ← Critical for multi-tenant
  permissions: permissions,      // Calculated permissions
};

const token = JwtUtil.generateToken(payload);
```

### Step 4: Permission Checking

```typescript
// In permission middleware
const hasPermission = (module: string, feature: string, requiredPermission: number) => {
  const userPermissions = req.user.permissions;
  const featurePermission = userPermissions[module]?.[feature] || 0;
  
  // Check if user has required permission
  return (featurePermission & requiredPermission) === requiredPermission;
};
```

---

## Role Service in Multi-Tenant

### Creating Roles

```typescript
// RoleService.createCustomRole()
// Automatically scoped to tenant database via RoleModel

export class RoleService {
  static async createCustomRole(roleData: CreateRoleRequest) {
    // RoleModel automatically uses correct tenant database
    const role = await RoleModel.create({
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      tenantRefId: req.tenantRefId,  // From tenant context
      isSystemRole: false,
      isActive: true,
    });
    
    return role;
  }
}
```

### Finding Roles

```typescript
// All role queries automatically scoped to tenant

// Find role by ID (scoped to tenant DB)
const role = await RoleModel.findById(roleId);
// Only searches in current tenant's database

// Find role by name (scoped to tenant DB)
const role = await RoleModel.findOne({ name: "Manager" });
// Only searches in current tenant's database

// List all roles (scoped to tenant DB)
const roles = await RoleModel.find({ isActive: true });
// Only returns roles from current tenant's database
```

### Updating Roles

```typescript
// Role updates automatically scoped to tenant

const role = await RoleModel.findById(roleId);
role.permissions = newPermissions;
await role.save();
// Updates only in current tenant's database
```

---

## User-Role Assignment

### Assigning Custom Roles to Users

```typescript
// UserService.assignRole()
// Automatically scoped to tenant database

export class UserService {
  static async assignRole(userId: string, roleId: string) {
    // Verify role exists in tenant database
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // Update user (scoped to tenant DB)
    const user = await UserModel.findById(userId);
    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      await user.save();
    }
  }
}
```

### User Permissions Calculation

```typescript
// Calculate user's effective permissions
// Combines system role permissions with custom role permissions

export class UserService {
  static async getUserPermissions(user: UserDocument) {
    let permissions: Record<string, Record<string, number>> = {};
    
    // 1. Get system role permissions
    if (user.role === "ADMIN" || user.role === "HR") {
      permissions = PermissionManager.buildSystemRolePermissions(user.role);
    }
    
    // 2. Get custom role permissions (for USER role or additional roles)
    if (user.roles && user.roles.length > 0) {
      const customRoles = await RoleModel.find({
        _id: { $in: user.roles },
        isActive: true
      });
      
      const customPermissions = PermissionManager.buildRolePermissions(
        customRoles.map(r => r.permissions)
      );
      
      // Merge: system permissions OR custom permissions
      permissions = PermissionManager.buildRolePermissions([
        permissions,
        customPermissions
      ]);
    }
    
    return permissions;
  }
}
```

---

## Default Roles Per Tenant

### Creating Default Roles

When a new tenant is created, you can create default roles:

```typescript
// In tenant creation service
export class TenantService {
  static async createTenant(tenantData: CreateTenantRequest) {
    // 1. Create tenant in identity service
    const tenant = await IdentityService.createTenant(tenantData);
    
    // 2. Create default roles for this tenant
    await RoleService.createDefaultRoles({
      tenantRefId: tenant.tenantRefId,
      createdBy: null
    });
    
    // Creates:
    // - READ_ONLY role (for USER role users)
    // - Any other default roles
  }
}
```

### Default Roles Structure

```typescript
// Default roles created per tenant
const defaultRoles = [
  {
    name: "READ_ONLY",
    description: "Read-only access",
    permissions: {},  // Empty - no permissions
    isSystemRole: true,
    tenantRefId: "tenant1"
  }
];
```

---

## Permission Checking in Controllers

### Using Permission Middleware

```typescript
import { checkPermission } from '../middlewares/permission.middleware';

// Check if user has READ permission for license feature
router.get('/licenses',
  tenantMiddleware,  // Sets tenant context
  checkPermission('company_documents', 'license', PERMISSIONS.READ),
  LicenseController.getAll
);

// Check if user has WRITE permission for license feature
router.post('/licenses',
  tenantMiddleware,
  checkPermission('company_documents', 'license', PERMISSIONS.WRITE),
  LicenseController.create
);
```

### Permission Middleware Implementation

```typescript
export const checkPermission = (
  module: string,
  feature: string,
  requiredPermission: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || {};
    const featurePermission = userPermissions[module]?.[feature] || 0;
    
    // Check if user has required permission
    if ((featurePermission & requiredPermission) !== requiredPermission) {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INSUFFICIENT_PERMISSIONS);
    }
    
    next();
  };
};
```

---

## Best Practices

### 1. Always Use Tenant-Aware Models

✅ **Correct:**
```typescript
const role = await RoleModel.findById(roleId);
// Automatically uses correct tenant database
```

❌ **Incorrect:**
```typescript
import Role from '../models/role.model';
const role = await Role.findById(roleId);
// Uses default connection, wrong tenant!
```

### 2. Don't Filter by tenantRefId in Queries

✅ **Correct:**
```typescript
// Models automatically scoped to tenant DB
const roles = await RoleModel.find({ isActive: true });
```

❌ **Incorrect:**
```typescript
// Don't add tenantRefId filter - it's already scoped!
const roles = await RoleModel.find({ 
  isActive: true,
  tenantRefId: req.tenantRefId  // ← Unnecessary!
});
```

### 3. Verify Role Belongs to Tenant

✅ **Correct:**
```typescript
// When assigning role to user, verify it exists in tenant DB
const role = await RoleModel.findById(roleId);
if (!role) {
  throw new Error('Role not found in tenant');
}
```

### 4. System Roles Don't Need Role Documents

✅ **Correct:**
```typescript
// ADMIN and HR don't need Role documents
// Their permissions are calculated from system role
if (user.role === "ADMIN" || user.role === "HR") {
  permissions = PermissionManager.buildSystemRolePermissions(user.role);
}
```

---

## Migration Considerations

### Existing Roles

If migrating existing single-tenant data:

1. **Assign all existing roles to default tenant**
2. **Add tenantRefId to all role documents**
3. **Update unique indexes to include tenantRefId**

### Role Name Conflicts

In multi-tenant:
- Same role name can exist in different tenants
- Unique constraint: `{ tenantRefId: 1, name: 1, isActive: 1 }`
- Each tenant can have its own "Manager" role with different permissions

---

## Summary

### Key Points

1. **System Roles (ADMIN/HR/USER)**: Stored in `user.role` field, not in Role collection
2. **Custom Roles**: Stored in Role collection, tenant-specific
3. **Permissions**: Calculated from system role + custom roles
4. **Tenant Isolation**: Each tenant has its own Role collection
5. **Automatic Scoping**: Models automatically use correct tenant database

### Permission Flow

```
User Login
  ↓
Get User (from tenant DB)
  ↓
Check user.role (ADMIN/HR/USER)
  ↓
If ADMIN/HR: Use system role permissions
If USER: Get custom roles (from tenant DB)
  ↓
Calculate effective permissions
  ↓
Include in JWT token
  ↓
Use in permission middleware
```

---

**Document Version**: 1.0  
**Last Updated**: 2024
