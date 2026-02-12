/**
 * Team Types
 * Types related to admin team management
 */

import { AdminRole, AdminStatus, Permission } from './auth';

// =============================================================================
// Team Member
// =============================================================================

/**
 * Team member (admin user)
 */
export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: AdminRole;
  roleId: number;
  roleName: string;
  departmentId: number | null;
  departmentName: string | null;
  status: AdminStatus;
  mfaEnabled: boolean;
  lastActive?: string;
  createdAt: string;
}

/**
 * Team member filters
 */
export interface TeamFilters {
  search?: string;
  roleId?: number;
  departmentId?: number;
  status?: AdminStatus;
}

// =============================================================================
// Role
// =============================================================================

/**
 * Role definition
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  memberCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update role request
 */
export interface RoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

// =============================================================================
// Department
// =============================================================================

/**
 * Department
 */
export interface Department {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update department request
 */
export interface DepartmentRequest {
  name: string;
  description?: string;
}

// =============================================================================
// Admin Management
// =============================================================================

/**
 * Invite admin request
 */
export interface InviteAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  departmentId?: number;
}

/**
 * Update admin request
 */
export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  roleId?: number;
  departmentId?: number;
  status?: AdminStatus;
}
