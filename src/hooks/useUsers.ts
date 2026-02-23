/**
 * User Hooks
 * React Query hooks for platform user operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '../services/userService';
import { walletService } from '../services/walletService';
import { queryKeys } from '../lib/queryClient';
import type { UserFilters } from '../types/user';

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook to get paginated users with filters
 */
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.getUsers(filters),
  });
};

/**
 * Hook to get a single user by ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

/**
 * Hook to get user statistics
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: userService.getStats,
  });
};

/**
 * Hook to get user's KYC documents
 */
export const useUserKyc = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'kyc'],
    queryFn: () => userService.getKycDocuments(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to get user's activity log
 */
export const useUserActivity = (userId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'activity', params],
    queryFn: () => userService.getUserActivity(userId, params),
    enabled: !!userId,
  });
};

/**
 * Hook to get user's wallets (crypto + fiat from backend)
 */
export const useUserWallets = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'wallets'],
    queryFn: () => walletService.getWalletsByUser(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to get user's login history
 */
export const useUserLoginHistory = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'login-history'],
    queryFn: () => userService.getLoginHistory(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to get user's notes
 */
export const useUserNotes = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'notes'],
    queryFn: () => userService.getNotes(userId),
    enabled: !!userId,
  });
};

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to suspend a user
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      userService.suspendUser(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Hook to unsuspend a user
 */
export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.unsuspendUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Hook to freeze a user
 */
export const useFreezeUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      userService.freezeUser(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Hook to unfreeze a user
 */
export const useUnfreezeUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.unfreezeUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Hook to close a user account
 */
export const useCloseAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      userService.closeAccount(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

// =============================================================================
// KYC Hooks
// =============================================================================

/**
 * Hook to approve KYC
 */
export const useApproveKyc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, documentId }: { userId: string; documentId: string }) =>
      userService.approveKyc(userId, documentId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.users.detail(userId), 'kyc'] });
    },
  });
};

/**
 * Hook to reject KYC
 */
export const useRejectKyc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      documentId,
      reason,
    }: {
      userId: string;
      documentId: string;
      reason: string;
    }) => userService.rejectKyc(userId, documentId, reason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.users.detail(userId), 'kyc'] });
    },
  });
};

/**
 * Hook to request additional KYC documents
 */
export const useRequestKycDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      documentTypes,
      message,
    }: {
      userId: string;
      documentTypes: string[];
      message?: string;
    }) => userService.requestKycDocuments(userId, documentTypes, message),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    },
  });
};

// =============================================================================
// Notes Hooks
// =============================================================================

/**
 * Hook to add a note to a user
 */
export const useAddUserNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note: string }) =>
      userService.addNote(userId, note),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.users.detail(userId), 'notes'] });
    },
  });
};

// =============================================================================
// Export Hook
// =============================================================================

/**
 * Hook to export users
 */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: (filters?: UserFilters) => userService.exportUsers(filters),
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to export users');
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
