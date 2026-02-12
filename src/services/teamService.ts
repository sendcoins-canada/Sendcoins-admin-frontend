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
   * Get paginated list of team members
   */
  getMembers: async (filters?: TeamFilters): Promise<PaginatedResponse<TeamMember>> => {
    const response = await api.get<PaginatedResponse<TeamMember>>('/admin-users', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get team member by ID
   */
  getMember: async (id: string): Promise<TeamMember> => {
    const response = await api.get<TeamMember>(`/admin-users/${id}`);
    return response.data;
  },

  /**
   * Invite a new admin
   */
  inviteAdmin: async (data: InviteAdminRequest): Promise<TeamMember> => {
    const response = await api.post<TeamMember>('/admin-users', data);
    return response.data;
  },

  /**
   * Update team member
   */
  updateMember: async (id: string, data: UpdateAdminRequest): Promise<TeamMember> => {
    const response = await api.patch<TeamMember>(`/admin-users/${id}`, data);
    return response.data;
  },

  /**
   * Suspend team member
   */
  suspendMember: async (id: string, reason?: string): Promise<void> => {
    await api.post(`/admin-users/${id}/suspend`, { reason });
  },

  /**
   * Activate team member
   */
  activateMember: async (id: string): Promise<void> => {
    await api.post(`/admin-users/${id}/activate`);
  },

  /**
   * Deactivate team member
   */
  deactivateMember: async (id: string): Promise<void> => {
    await api.post(`/admin-users/${id}/deactivate`);
  },

  /**
   * Resend invitation email
   */
  resendInvitation: async (id: string): Promise<void> => {
    await api.post(`/admin-users/${id}/resend-invite`);
  },

  /**
   * Reset member's MFA
   */
  resetMemberMfa: async (id: string): Promise<void> => {
    await api.post(`/admin-users/${id}/reset-mfa`);
  },

  // =========================================================================
  // Roles
  // =========================================================================

  /**
   * Get all roles
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },

  /**
   * Get role by ID
   */
  getRole: async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Create a new role
   */
  createRole: async (data: RoleRequest): Promise<Role> => {
    const response = await api.post<Role>('/roles', data);
    return response.data;
  },

  /**
   * Update a role
   */
  updateRole: async (id: number, data: RoleRequest): Promise<Role> => {
    const response = await api.patch<Role>(`/roles/${id}`, data);
    return response.data;
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  /**
   * Get all available permissions
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/permissions');
    return response.data;
  },

  // =========================================================================
  // Departments
  // =========================================================================

  /**
   * Get all departments
   */
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<Department[]>('/departments');
    return response.data;
  },

  /**
   * Get department by ID
   */
  getDepartment: async (id: number): Promise<Department> => {
    const response = await api.get<Department>(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create a new department
   */
  createDepartment: async (data: DepartmentRequest): Promise<Department> => {
    const response = await api.post<Department>('/departments', data);
    return response.data;
  },

  /**
   * Update a department
   */
  updateDepartment: async (id: number, data: DepartmentRequest): Promise<Department> => {
    const response = await api.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a department
   */
  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },
};

export default teamService;
