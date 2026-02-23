/**
 * Team Hooks
 * React Query hooks for team management operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { queryKeys } from '../lib/queryClient';
import type {
  TeamFilters,
  InviteAdminRequest,
  UpdateAdminRequest,
  RoleRequest,
  DepartmentRequest,
} from '../types/team';

// =============================================================================
// Team Member Hooks
// =============================================================================

/**
 * Hook to get paginated team members
 */
export const useTeamMembers = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: queryKeys.team.members(filters),
    queryFn: () => teamService.getMembers(filters),
  });
};

/**
 * Hook to get a single team member
 */
export const useTeamMember = (id: string) => {
  return useQuery({
    queryKey: queryKeys.team.member(id),
    queryFn: () => teamService.getMember(id),
    enabled: !!id,
  });
};

/**
 * Hook to invite a new admin
 */
export const useInviteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteAdminRequest) => teamService.inviteAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

/**
 * Hook to update a team member
 */
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminRequest }) =>
      teamService.updateMember(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.member(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

/**
 * Hook to suspend a team member
 */
export const useSuspendMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      teamService.suspendMember(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.member(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

/**
 * Hook to activate a team member
 */
export const useActivateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.activateMember(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.member(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

/**
 * Hook to deactivate a team member
 */
export const useDeactivateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.deactivateMember(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.member(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

/**
 * Hook to permanently delete a team member (remove from database)
 */
export const useDeleteMemberPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.deleteMemberPermanently(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.member(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
};

/**
 * Hook to resend invitation
 */
export const useResendInvitation = () => {
  return useMutation({
    mutationFn: (id: string) => teamService.resendInvitation(id),
  });
};

/**
 * Hook to reset member's MFA
 */
export const useResetMemberMfa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.resetMemberMfa(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.member(id) });
    },
  });
};

// =============================================================================
// Role Hooks
// =============================================================================

/**
 * Hook to get all roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.team.roles(),
    queryFn: teamService.getRoles,
  });
};

/**
 * Hook to get a single role
 */
export const useRole = (id: number) => {
  return useQuery({
    queryKey: queryKeys.team.role(id),
    queryFn: () => teamService.getRole(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleRequest) => teamService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.roles() });
    },
  });
};

/**
 * Hook to update a role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleRequest }) =>
      teamService.updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.role(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.roles() });
    },
  });
};

/**
 * Hook to delete a role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teamService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.roles() });
    },
  });
};

/**
 * Hook to get all permissions
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: queryKeys.team.permissions(),
    queryFn: teamService.getPermissions,
  });
};

// =============================================================================
// Department Hooks
// =============================================================================

/**
 * Hook to get all departments
 */
export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.team.departments(),
    queryFn: teamService.getDepartments,
  });
};

/**
 * Hook to get a single department
 */
export const useDepartment = (id: number) => {
  return useQuery({
    queryKey: queryKeys.team.department(id),
    queryFn: () => teamService.getDepartment(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a department
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepartmentRequest) => teamService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.departments() });
    },
  });
};

/**
 * Hook to update a department
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepartmentRequest }) =>
      teamService.updateDepartment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.department(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.departments() });
    },
  });
};

/**
 * Hook to delete a department
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teamService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.departments() });
    },
  });
};
