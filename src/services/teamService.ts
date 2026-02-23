/**
 * Team Service
 * Handles all team management API calls
 */

import { api } from '../lib/api';
import type {
  TeamMember,
  TeamFilters,
  Role,
  RoleRequest,
  Department,
  DepartmentRequest,
  InviteAdminRequest,
  UpdateAdminRequest,
} from '../types/team';
import type { Permission } from '../types/auth';
import type { PaginatedResponse } from '../types/common';

// =============================================================================
// Team Members
// =============================================================================

export const teamService = {
  /**
   * Get paginated list of team members.
   * Backend returns { admins, pagination } with firstName, lastName, dynamicRole, department.
   * Normalize to fullName, roleName, departmentName for the table.
   */
  getMembers: async (filters?: TeamFilters): Promise<PaginatedResponse<TeamMember>> => {
    const response = await api.get<{
      admins: Array<{
        id: number;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        status: string;
        role?: string;
        roleId?: number | null;
        dynamicRole?: { id: number; title: string; status?: string; permissions?: string[] } | null;
        departmentId?: number | null;
        department?: { id: number; name: string } | null;
        passwordSet?: boolean;
        mfaEnabled?: boolean;
        lastActive?: string | null;
        createdAt: string;
        updatedAt?: string | null;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/admin-users', { params: filters });
    const admins = response?.admins ?? [];
    const p = response?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
    const data: TeamMember[] = admins.map((a) => {
      const fullName = [a.firstName, a.lastName].filter(Boolean).join(' ').trim() || a.email;
      return {
        id: String(a.id),
        email: a.email,
        firstName: a.firstName ?? '',
        lastName: a.lastName ?? '',
        fullName,
        role: (a.role as TeamMember['role']) ?? 'ENGINEER',
        roleId: a.roleId ?? 0,
        roleName: a.dynamicRole?.title ?? a.role ?? '-',
        departmentId: a.departmentId ?? null,
        departmentName: a.department?.name ?? null,
        status: a.status as TeamMember['status'],
        mfaEnabled: a.mfaEnabled ?? false,
        lastActive: a.lastActive ?? undefined,
        createdAt: a.createdAt,
      };
    });
    return {
      data,
      pagination: {
        ...p,
        hasNext: p.page < p.totalPages,
        hasPrev: p.page > 1,
      },
    };
  },

  /**
   * Get team member by ID (backend returns single object)
   */
  getMember: async (id: string): Promise<TeamMember> => {
    const response = await api.get<TeamMember>(`/admin-users/${id}`);
    return response as TeamMember;
  },

  /**
   * Invite a new admin (backend returns created admin)
   */
  inviteAdmin: async (data: InviteAdminRequest): Promise<TeamMember> => {
    const response = await api.post<TeamMember>('/admin-users', data);
    return response as TeamMember;
  },

  /**
   * Update team member (backend returns updated admin)
   */
  updateMember: async (id: string, data: UpdateAdminRequest): Promise<TeamMember> => {
    const response = await api.patch<TeamMember>(`/admin-users/${id}`, data);
    return response as TeamMember;
  },

  /**
   * Suspend team member (backend: deactivate = DELETE)
   */
  suspendMember: async (id: string, _reason?: string): Promise<void> => {
    await api.delete(`/admin-users/${id}`);
  },

  /**
   * Activate team member (backend: reactivate)
   */
  activateMember: async (id: string): Promise<void> => {
    await api.post(`/admin-users/${id}/reactivate`);
  },

  /**
   * Deactivate team member (backend: DELETE, soft)
   */
  deactivateMember: async (id: string): Promise<void> => {
    await api.delete(`/admin-users/${id}`);
  },

  /**
   * Permanently delete team member (remove from database)
   */
  deleteMemberPermanently: async (id: string): Promise<void> => {
    await api.delete(`/admin-users/${id}?permanent=true`);
  },

  /**
   * Resend invitation email
   */
  resendInvitation: async (id: string): Promise<void> => {
    await api.post(`/admin-users/${id}/resend-invite`);
  },

  /**
   * Reset member's MFA (backend may not implement; no-op on 404)
   */
  resetMemberMfa: async (id: string): Promise<void> => {
    try {
      await api.post(`/admin-users/${id}/reset-mfa`);
    } catch {
      // Backend may not have this endpoint yet
    }
  },

  // =========================================================================
  // Roles
  // =========================================================================

  /**
   * Get all roles (backend returns array or { data } depending on impl)
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[] | { data: Role[] }>('/roles');
    return Array.isArray(response) ? response : (response as { data: Role[] })?.data ?? [];
  },

  /**
   * Get role by ID
   */
  getRole: async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response as Role;
  },

  /**
   * Create a new role
   */
  createRole: async (data: RoleRequest): Promise<Role> => {
    const response = await api.post<Role>('/roles', data);
    return response as Role;
  },

  /**
   * Update a role
   */
  updateRole: async (id: number, data: RoleRequest): Promise<Role> => {
    const response = await api.patch<Role>(`/roles/${id}`, data);
    return response as Role;
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  /**
   * Get all available permissions (backend returns array)
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[] | { data: Permission[] }>('/permissions');
    return Array.isArray(response) ? response : (response as { data: Permission[] })?.data ?? [];
  },

  // =========================================================================
  // Departments
  // =========================================================================

  /**
   * Get all departments
   */
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<Department[] | { data: Department[] }>('/departments');
    return Array.isArray(response) ? response : (response as { data: Department[] })?.data ?? [];
  },

  /**
   * Get department by ID
   */
  getDepartment: async (id: number): Promise<Department> => {
    const response = await api.get<Department>(`/departments/${id}`);
    return response as Department;
  },

  /**
   * Create a new department
   */
  createDepartment: async (data: DepartmentRequest): Promise<Department> => {
    const response = await api.post<Department>('/departments', data);
    return response as Department;
  },

  /**
   * Update a department
   */
  updateDepartment: async (id: number, data: DepartmentRequest): Promise<Department> => {
    const response = await api.patch<Department>(`/departments/${id}`, data);
    return response as Department;
  },

  /**
   * Delete a department
   */
  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },
};

export default teamService;
