# Multi-Tenant Quick Reference Guide

## Architecture Comparison

### Before (Single-Tenant)

```
┌─────────────────────────────────────────┐
│         CBS Application                 │
│                                         │
│  ┌──────────┐    ┌──────────┐          │
│  │  Routes  │───▶│ Services │          │
│  └──────────┘    └────┬─────┘          │
│                       │                 │
│                       ▼                 │
│              ┌──────────────┐          │
│              │    Models    │          │
│              └──────┬───────┘          │
│                     │                  │
└─────────────────────┼──────────────────┘
                      │
                      ▼
         ┌────────────────────┐
         │   Single Database  │
         │      CBS_DB         │
         │                     │
         │  - User             │
         │  - Role             │
         │  - Document         │
         │  - Employee         │
         │  - ...               │
         └────────────────────┘
```

### After (Multi-Tenant)

```
┌─────────────────────────────────────────────────────────┐
│              CBS Application                           │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│  │  Routes  │───▶│ Tenant   │───▶│  Services    │    │
│  │          │    │Middleware│    │              │    │
│  └──────────┘    └────┬─────┘    └──────┬───────┘    │
│                       │                  │            │
│                       ▼                  ▼            │
│              ┌──────────────┐    ┌──────────────┐     │
│              │ Tenant       │    │ Tenant-Aware │     │
│              │ Context      │    │ Models       │     │
│              └──────┬───────┘    └──────┬───────┘     │
└─────────────────────┼───────────────────┼─────────────┘
                      │                   │
                      │                   │
         ┌─────────────┴──────────┐       │
         │                          │       │
         ▼                          ▼       ▼
┌─────────────────┐      ┌──────────────────────┐
│ Identity Service│      │  MongoDB Instance     │
│  (Shared DB)    │      │                       │
│                 │      │  ┌─────────────────┐  │
│  - tenant       │      │  │ CBS_tenant1     │  │
│  - user (auth)  │      │  │ - User          │  │
└─────────────────┘      │  │ - Role          │  │
                         │  │ - Document     │  │
                         │  └─────────────────┘  │
                         │                       │
                         │  ┌─────────────────┐  │
                         │  │ CBS_tenant2     │  │
                         │  │ - User          │  │
                         │  │ - Role          │  │
                         │  │ - Document     │  │
                         │  └─────────────────┘  │
                         │                       │
                         │  ┌─────────────────┐  │
                         │  │ CBS_tenantN     │  │
                         │  │ ...             │  │
                         │  └─────────────────┘  │
                         └───────────────────────┘
```

---

## Code Changes Summary

### 1. Model Imports (Change in Every Service File)

**Before:**
```typescript
import User from '../models/user.model';
import Role from '../models/role.model';
```

**After:**
```typescript
import { UserModel, RoleModel } from '../models';
```

### 2. Model Usage (No Changes Needed!)

**Before & After (Same):**
```typescript
const user = await UserModel.findOne({ username });
const role = await RoleModel.findById(roleId);
```

Models automatically use the correct tenant database!

### 3. Route Setup (Add Middleware)

**Before:**
```typescript
router.get('/users', UserController.getAll);
```

**After:**
```typescript
import { tenantMiddleware } from '../middlewares/tenant.middleware';

router.use(tenantMiddleware);  // Add this line
router.get('/users', UserController.getAll);
```

### 4. JWT Token (Add tenantRefId)

**Before:**
```typescript
const payload = {
  userId: user._id.toString(),
  username: user.username,
  role: user.role,
  permissions: permissions,
};
```

**After:**
```typescript
const payload = {
  userId: user._id.toString(),
  username: user.username,
  role: user.role,
  tenantRefId: user.tenantRefId,  // Add this
  permissions: permissions,
};
```

### 5. User Model Schema (Add Field)

**Before:**
```typescript
const userSchema = new Schema({
  username: String,
  email: String,
  // ... other fields
});
```

**After:**
```typescript
const userSchema = new Schema({
  username: String,
  email: String,
  tenantRefId: { type: String, required: true, index: true },  // Add this
  // ... other fields
});
```

---

## File-by-File Changes

### New Files (Create These)

1. **`src/utils/tenant-context.ts`** - Tenant context management
2. **`src/middlewares/tenant.middleware.ts`** - Tenant middleware
3. **`src/models/index.ts`** - Model bootstrap and exports

### Modified Files (Update These)

1. **`src/models/user.model.ts`**
   - Add `tenantRefId` field
   - Update indexes to include `tenantRefId`

2. **`src/models/role.model.ts`**
   - Add `tenantRefId` field
   - Update indexes to include `tenantRefId`

3. **`src/utils/jwt.util.ts`**
   - Add `tenantRefId` to `UserJwtPayload` interface

4. **`src/services/auth.service.ts`**
   - Add `tenantRefId` to JWT payload

5. **`src/interfaces/model.interface.ts`**
   - Add `tenantRefId` to `UserDocument` interface

6. **All Service Files** (`src/services/*.service.ts`)
   - Change model imports from direct imports to `models/index.ts`

7. **All Route Files** (`src/routes/*.routes.ts`)
   - Add `tenantMiddleware` to protected routes

---

## Implementation Order

### Step 1: Create Core Infrastructure (30 min)
1. Create `src/utils/tenant-context.ts`
2. Create `src/middlewares/tenant.middleware.ts`
3. Create `src/models/index.ts` with bootstrap function

### Step 2: Update Models (20 min)
1. Add `tenantRefId` to User model
2. Add `tenantRefId` to Role model
3. Update indexes
4. Create tenant-aware model proxies

### Step 3: Update Authentication (15 min)
1. Update JWT interface
2. Update auth service
3. Update user interface

### Step 4: Update Services (30 min)
1. Update all service files to use tenant-aware models
2. Test each service

### Step 5: Update Routes (15 min)
1. Add tenant middleware to all route files
2. Test all endpoints

### Step 6: Testing (1-2 hours)
1. Test login flow
2. Test data isolation
3. Test all CRUD operations

**Total Estimated Time: 2-3 hours**

---

## Common Patterns

### Pattern 1: Service Method (No Changes Needed!)

```typescript
// This works exactly the same before and after migration
export class UserService {
  static async findByUsernameOrEmail(username: string) {
    const user = await UserModel.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    return user;
  }
}
```

### Pattern 2: Controller Method (No Changes Needed!)

```typescript
// This works exactly the same before and after migration
export class UserController {
  static async getAll(req: Request, res: Response) {
    const users = await UserService.getAll();
    res.json(users);
  }
}
```

### Pattern 3: Query with Filters (No Changes Needed!)

```typescript
// This automatically scopes to tenant database
const documents = await DocumentModel.find({
  status: 'active',
  category: 'legal'
});
```

---

## Testing Checklist

### ✅ Login Flow
- [ ] User can login with username/password
- [ ] JWT token contains `tenantRefId`
- [ ] Token is valid and can be verified

### ✅ Data Isolation
- [ ] User from Tenant A cannot see Tenant B's data
- [ ] Roles are tenant-specific
- [ ] Documents are tenant-specific

### ✅ CRUD Operations
- [ ] Create user (scoped to tenant)
- [ ] Read user (only from tenant DB)
- [ ] Update user (only in tenant DB)
- [ ] Delete user (only from tenant DB)

### ✅ Role & Permissions
- [ ] Roles are tenant-specific
- [ ] Permissions work correctly
- [ ] System roles (ADMIN/HR/USER) work per tenant

---

## Troubleshooting

### Issue: "No tenant context available"

**Cause**: Tenant middleware not applied to route

**Solution**: Add `router.use(tenantMiddleware)` before routes

### Issue: "Tenant ID not found in JWT token"

**Cause**: JWT token doesn't contain `tenantRefId`

**Solution**: Update auth service to include `tenantRefId` in JWT payload

### Issue: "Model not found"

**Cause**: Models not bootstrapped for tenant connection

**Solution**: Ensure `bootstrapModelsForTenant()` is called in tenant middleware

### Issue: "Duplicate key error"

**Cause**: Unique indexes not updated to include `tenantRefId`

**Solution**: Update model indexes to include `tenantRefId` in unique constraints

---

## Database Naming Convention

```
Tenant Database Name: CBS_{tenantRefId}

Examples:
- tenantRefId: "abc123" → Database: "CBS_abc123"
- tenantRefId: "xyz789" → Database: "CBS_xyz789"
```

---

## Key Principles

1. **Automatic Routing**: Models automatically use correct tenant database
2. **No Manual Filtering**: Don't add `tenantRefId` filters in queries
3. **Context Isolation**: Each request has isolated tenant context
4. **Connection Reuse**: Connections are cached and reused
5. **Lazy Creation**: Databases created automatically on first access

---

## Migration Checklist

- [ ] Phase 1: Core Infrastructure
- [ ] Phase 2: Model Updates
- [ ] Phase 3: Service Updates
- [ ] Phase 4: Authentication Updates
- [ ] Phase 5: Route Updates
- [ ] Phase 6: Testing
- [ ] Phase 7: Database Migration (if needed)
- [ ] Phase 8: Production Deployment

---

**Quick Start**: Follow the implementation order above, test each phase, then move to the next.
