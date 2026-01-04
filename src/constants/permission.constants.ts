/**
 * Permission Constants and CBS Module Features
 * All features and permissions are hardcoded in the code
 */

import { SYSTEM_ROLES } from "./enums.constants";
import { throwError } from "../utils/errors.util";
import { ERROR_MESSAGES } from "./error-messages.constants";

// Interface for feature objects
interface Feature {
  id: number;
  name: string;
  description: string;
  module: string;
  label: string;
}

// Permission bitmask values
export const PERMISSIONS = {
  NONE: 0, // 0000
  READ: 2, // 0010
  WRITE: 4, // 0100
} as const;

// Dashboard Module Features
export const dashboardFeatures = [
  {
    id: 1001,
    name: "Dashboard",
    description: "Access to dashboard overview",
    module: "dashboard",
    label: "dashboard",
  },
];

// Banking Module Features
export const bankingFeatures = [
  {
    id: 2001,
    name: "Cheque Printing",
    description: "Print and manage cheques",
    module: "banking",
    label: "cheque_printing",
  },
  {
    id: 2002,
    name: "Telex Transfer",
    description: "Manage telex transfers",
    module: "banking",
    label: "telex_transfer",
  },
  {
    id: 2003,
    name: "Cash Flow Forecast",
    description: "View and manage cash flow forecasts",
    module: "banking",
    label: "cash_flow_forecast",
  },
  {
    id: 2004,
    name: "Daily Bank Balance",
    description: "View daily bank balances",
    module: "banking",
    label: "daily_bank_balance",
  },
  {
    id: 2005,
    name: "Balance Sheet",
    description: "View balance sheet reports",
    module: "banking",
    label: "balance_sheet",
  },
  {
    id: 2006,
    name: "P&L Statement",
    description: "View profit and loss statements",
    module: "banking",
    label: "pl_statement",
  },
];

// Company Documents Module Features
export const companyDocumentsFeatures = [
  {
    id: 3001,
    name: "License",
    description: "Manage company licenses",
    module: "company_documents",
    label: "license",
  },
  {
    id: 3002,
    name: "Legal Docs",
    description: "Manage legal documents",
    module: "company_documents",
    label: "legal_docs",
  },
  {
    id: 3003,
    name: "Audit",
    description: "Manage audit documents",
    module: "company_documents",
    label: "audit",
  },
  {
    id: 3004,
    name: "ISO",
    description: "Manage ISO certificates",
    module: "company_documents",
    label: "iso",
  },
];

// Asset Management Module Features
export const assetManagementFeatures = [
  {
    id: 4001,
    name: "Land and Building",
    description: "Manage land and building assets",
    module: "asset_management",
    label: "land_and_building",
  },
  {
    id: 4002,
    name: "Vehicle",
    description: "Manage vehicle assets",
    module: "asset_management",
    label: "vehicle",
  },
  {
    id: 4003,
    name: "Equipment",
    description: "Manage equipment assets",
    module: "asset_management",
    label: "equipment",
  },
  {
    id: 4004,
    name: "Furniture",
    description: "Manage furniture assets",
    module: "asset_management",
    label: "furniture",
  },
];

// IT Management Module Features
export const itManagementFeatures = [
  {
    id: 5001,
    name: "Hardware",
    description: "Manage IT hardware",
    module: "it_management",
    label: "hardware",
  },
  {
    id: 5002,
    name: "Software Licenses",
    description: "Manage software licenses",
    module: "it_management",
    label: "software_licenses",
  },
  {
    id: 5003,
    name: "Network Equipment",
    description: "Manage network equipment",
    module: "it_management",
    label: "network_equipment",
  },
  {
    id: 5004,
    name: "IT Support",
    description: "Manage IT support tickets",
    module: "it_management",
    label: "it_support",
  },
  {
    id: 5005,
    name: "SIM Management",
    description: "Manage SIM cards",
    module: "it_management",
    label: "sim_management",
  },
  {
    id: 5006,
    name: "Hardware Transfer",
    description: "Manage hardware transfers",
    module: "it_management",
    label: "hardware_transfer",
  },
];

// Settings Module Features (Admin Only)
export const settingsFeatures = [
  {
    id: 6001,
    name: "Settings",
    description: "System settings (Admin only)",
    module: "settings",
    label: "settings",
  },
];

// Module-specific feature maps
export const MODULE_FEATURES_MAP = new Map([
  ["dashboard", dashboardFeatures],
  ["banking", bankingFeatures],
  ["company_documents", companyDocumentsFeatures],
  ["asset_management", assetManagementFeatures],
  ["it_management", itManagementFeatures],
  ["settings", settingsFeatures],
] as Array<[string, Feature[]]>);

/**
 * Permission Manager Class
 * Handles permission-related operations and permission building logic
 */
export class PermissionManager {
  /**
   * Get all available modules
   */
  static getAvailableModules(): string[] {
    return Array.from(MODULE_FEATURES_MAP.keys());
  }

  /**
   * Get features for a specific module
   */
  static getModuleFeatures(module: string): Feature[] {
    return MODULE_FEATURES_MAP.get(module) || [];
  }

  /**
   * Get full permission value (READ + WRITE)
   */
  static getFullPermission(): number {
    return PERMISSIONS.READ | PERMISSIONS.WRITE; // 6
  }

  /**
   * Build complete permissions by including all modules and features
   * Sets PERMISSIONS.NONE (0) for features not present in user permissions
   * @param userPermissions - User's existing permissions
   * @returns Complete permissions with all modules and features
   */
  static buildCompletePermissions(
    userPermissions: Record<string, Record<string, number>>
  ): Record<string, Record<string, number>> {
    const completePermissions: Record<string, Record<string, number>> = {};
    const allModules = this.getAvailableModules();

    allModules.forEach((module) => {
      const features = this.getModuleFeatures(module);
      completePermissions[module] = {};

      features.forEach((feature) => {
        // Use user's permission if exists, otherwise NONE
        const userModulePermissions = userPermissions[module];
        completePermissions[module][feature.label] =
          userModulePermissions?.[feature.label] ?? PERMISSIONS.NONE;
      });
    });

    return completePermissions;
  }

  /**
   * Build system role permissions based on role type
   * - ADMIN: Full access to all modules including settings
   * - HR: Full access to all modules except settings (settings features set to NONE)
   * - USER: No system permissions (handled via custom roles array)
   */
  static buildSystemRolePermissions(
    roleType: string
  ): Record<string, Record<string, number>> {
    const permissions: Record<string, Record<string, number>> = {};
    const modules = this.getAvailableModules();
    const fullPermission = this.getFullPermission();

    // USER role has no system-level permissions (uses custom roles)
    if (roleType === SYSTEM_ROLES.USER) {
      return permissions;
    }

    modules.forEach((module) => {
      const features = this.getModuleFeatures(module);
      permissions[module] = {};

      features.forEach((feature) => {
        // Settings is admin-only, HR gets NONE
        if (module === "settings" && roleType !== SYSTEM_ROLES.ADMIN) {
          permissions[module][feature.label] = PERMISSIONS.NONE;
        } else {
          // ADMIN and HR both get full permission (READ + WRITE)
          permissions[module][feature.label] = fullPermission;
        }
      });
    });

    return permissions;
  }

  /**
   * Build role permissions by merging multiple role permissions using bitwise OR
   */
  static buildRolePermissions(
    rolePermissions: Record<string, Record<string, number>>[]
  ): Record<string, Record<string, number>> {
    return rolePermissions.reduce((acc, rolePermission) => {
      Object.entries(rolePermission).forEach(([module, modulePermissions]) => {
        acc[module] = acc[module] || {};
        Object.entries(modulePermissions).forEach(([feature, permission]) => {
          acc[module][feature] =
            (acc[module][feature] || 0) | (permission || 0);
        });
      });
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }

  /**
   * Normalize permissions by expanding WRITE (4) to include READ (2), resulting in full access (6)
   * This ensures that users with WRITE permission implicitly have READ permission as well
   */
  static normalizePermissions(
    permissions: Record<string, Record<string, number>>
  ): Record<string, Record<string, number>> {
    const normalizedPermissions: Record<string, Record<string, number>> = {};

    for (const [module, modulePermissions] of Object.entries(permissions)) {
      normalizedPermissions[module] = {};
      for (const [feature, permissionValue] of Object.entries(
        modulePermissions
      )) {
        // If permission includes WRITE (4), expand it to include READ (2) = 6
        if ((permissionValue & PERMISSIONS.WRITE) === PERMISSIONS.WRITE) {
          normalizedPermissions[module][feature] =
            PERMISSIONS.READ | PERMISSIONS.WRITE; // 6
        } else {
          normalizedPermissions[module][feature] = permissionValue;
        }
      }
    }

    return normalizedPermissions;
  }

  /**
   * Map feature labels to feature names for display in responses
   */
  static mapLabelsToNames(
    permissions: Record<string, Record<string, number>>
  ): Record<string, Record<string, number>> {
    const mappedPermissions: Record<string, Record<string, number>> = {};

    for (const [module, modulePermissions] of Object.entries(permissions)) {
      const features = this.getModuleFeatures(module);

      // Create a map of label -> name for this module
      const labelToNameMap = new Map(features.map((f) => [f.label, f.name]));

      mappedPermissions[module] = {};

      for (const [featureLabel, permissionValue] of Object.entries(
        modulePermissions
      )) {
        // Try to find the feature name, if not found, use the label as-is
        const featureName = labelToNameMap.get(featureLabel);
        if (featureName) {
          mappedPermissions[module][featureName] = permissionValue;
        } else {
          // If label not found in map, keep the original label (might be a name already)
          mappedPermissions[module][featureLabel] = permissionValue;
        }
      }
    }

    return mappedPermissions;
  }

  /**
   * Validate permissions structure and values
   */
  static validatePermissions(
    permissions: Record<string, Record<string, number>>
  ): void {
    if (!permissions || typeof permissions !== "object") {
      throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_MODULE);
    }

    for (const [module, modulePermissions] of Object.entries(permissions)) {
      if (!modulePermissions || typeof modulePermissions !== "object") {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_MODULE);
      }

      // Settings module can only be assigned to ADMIN role
      if (module === "settings") {
        throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.SETTINGS_ADMIN_ONLY);
      }

      // Get valid features for this module
      const validFeatures = this.getModuleFeatures(module);
      const validFeatureLabels = validFeatures.map((f) => f.label);

      for (const [feature, permission] of Object.entries(modulePermissions)) {
        // Validate permission value (only NONE=0, READ=2, or WRITE=4)
        if (
          typeof permission !== "number" ||
          (permission !== 0 && permission !== 2 && permission !== 4)
        ) {
          throw throwError(
            ERROR_MESSAGES.CLIENT_ERRORS.INVALID_PERMISSION_VALUE
          );
        }

        // Validate feature exists for this module
        if (!validFeatureLabels.includes(feature)) {
          throw throwError(ERROR_MESSAGES.CLIENT_ERRORS.INVALID_FEATURE_NAME);
        }
      }
    }
  }
}
