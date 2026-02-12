/**
 * Permission Constants
 * Metadata and utilities for the permission system
 */

import { Permission } from '@/types';

/**
 * Permission metadata for UI display
 */
export const PERMISSION_METADATA: Record<
  Permission,
  { label: string; description: string; category: string }
> = {
  READ_USERS: {
    label: 'Read Users',
    description: 'View user accounts and profiles',
    category: 'User Management',
  },
  SUSPEND_USERS: {
    label: 'Suspend Users',
    description: 'Ban or suspend user accounts',
    category: 'User Management',
  },
  READ_TRANSACTIONS: {
    label: 'Read Transactions',
    description: 'View transaction history and details',
    category: 'Transactions',
  },
  VERIFY_TRANSACTIONS: {
    label: 'Verify Transactions',
    description: 'Approve, reject, or flag transactions',
    category: 'Transactions',
  },
  READ_TX_HASH: {
    label: 'Read TX Hash',
    description: 'View blockchain transaction hashes',
    category: 'Transactions',
  },
  EXPORT_TRANSACTIONS: {
    label: 'Export Transactions',
    description: 'Export transaction data to CSV/JSON',
    category: 'Transactions',
  },
  READ_WALLETS: {
    label: 'Read Wallets',
    description: 'View user wallet balances and addresses',
    category: 'Wallets',
  },
  FREEZE_WALLETS: {
    label: 'Freeze Wallets',
    description: 'Freeze or unfreeze user wallets',
    category: 'Wallets',
  },
  READ_AUDIT_LOGS: {
    label: 'Read Audit Logs',
    description: 'View admin activity audit logs',
    category: 'Audit & Compliance',
  },
  VERIFY_KYC: {
    label: 'Verify KYC',
    description: 'Review and approve KYC documents',
    category: 'Audit & Compliance',
  },
  MANAGE_ADMINS: {
    label: 'Manage Admins',
    description: 'Create and manage admin accounts',
    category: 'Administration',
  },
  MANAGE_ROLES: {
    label: 'Manage Roles',
    description: 'Create and edit roles and permissions',
    category: 'Administration',
  },
  MANAGE_DEPARTMENTS: {
    label: 'Manage Departments',
    description: 'Create and manage departments',
    category: 'Administration',
  },
  VIEW_DASHBOARD: {
    label: 'View Dashboard',
    description: 'Access the main dashboard',
    category: 'Dashboard',
  },
  VIEW_ANALYTICS: {
    label: 'View Analytics',
    description: 'View platform analytics and metrics',
    category: 'Dashboard',
  },
  EXPORT_DATA: {
    label: 'Export Data',
    description: 'Export system data and reports',
    category: 'Data',
  },
  READ_NOTIFICATIONS: {
    label: 'Read Notifications',
    description: 'View admin notifications',
    category: 'Notifications',
  },
  MANAGE_NOTIFICATION_SETTINGS: {
    label: 'Manage Notification Settings',
    description: 'Configure notification preferences',
    category: 'Notifications',
  },
};

/**
 * Group permissions by category
 */
export const PERMISSIONS_BY_CATEGORY = Object.entries(PERMISSION_METADATA).reduce(
  (acc, [permission, metadata]) => {
    if (!acc[metadata.category]) {
      acc[metadata.category] = [];
    }
    acc[metadata.category].push({
      permission: permission as Permission,
      ...metadata,
    });
    return acc;
  },
  {} as Record<string, Array<{ permission: Permission; label: string; description: string }>>
);

/**
 * All permission categories
 */
export const PERMISSION_CATEGORIES = Object.keys(PERMISSIONS_BY_CATEGORY);

/**
 * All permissions as array
 */
export const ALL_PERMISSIONS = Object.keys(PERMISSION_METADATA) as Permission[];

/**
 * Default role permissions
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,

  MANAGER: [
    'READ_USERS',
    'SUSPEND_USERS',
    'READ_TRANSACTIONS',
    'VERIFY_TRANSACTIONS',
    'READ_TX_HASH',
    'EXPORT_TRANSACTIONS',
    'READ_WALLETS',
    'READ_AUDIT_LOGS',
    'VERIFY_KYC',
    'MANAGE_ADMINS',
    'VIEW_DASHBOARD',
    'VIEW_ANALYTICS',
    'EXPORT_DATA',
    'READ_NOTIFICATIONS',
  ],

  OPERATOR: [
    'READ_USERS',
    'READ_TRANSACTIONS',
    'VERIFY_TRANSACTIONS',
    'READ_TX_HASH',
    'READ_WALLETS',
    'VIEW_DASHBOARD',
    'READ_NOTIFICATIONS',
  ],

  SUPPORT: [
    'READ_USERS',
    'READ_TRANSACTIONS',
    'READ_TX_HASH',
    'READ_WALLETS',
    'VERIFY_KYC',
    'VIEW_DASHBOARD',
    'READ_NOTIFICATIONS',
  ],

  ENGINEER: [
    'READ_TRANSACTIONS',
    'READ_TX_HASH',
    'READ_AUDIT_LOGS',
    'VIEW_DASHBOARD',
    'VIEW_ANALYTICS',
    'READ_NOTIFICATIONS',
  ],
};
