/**
 * Platform Hooks
 * React Query hooks for platform operations (balance, revenue, settings)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../services/platformService';
import { queryKeys } from '../lib/queryClient';
import type { PlatformSettings } from '../services/platformService';

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook to get platform wallet balances
 */
export const usePlatformBalance = () => {
  return useQuery({
    queryKey: queryKeys.platform.balance(),
    queryFn: platformService.getBalance,
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to get platform revenue
 */
export const usePlatformRevenue = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.platform.revenue(params),
    queryFn: () => platformService.getRevenue(params),
  });
};

/**
 * Hook to get platform statistics
 */
export const usePlatformStats = () => {
  return useQuery({
    queryKey: [...queryKeys.platform.account(), 'stats'],
    queryFn: platformService.getStats,
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to get platform settings
 */
export const usePlatformSettings = () => {
  return useQuery({
    queryKey: queryKeys.platform.settings(),
    queryFn: platformService.getSettings,
  });
};

/**
 * Hook to get scheduled reports
 */
export const useScheduledReports = () => {
  return useQuery({
    queryKey: [...queryKeys.platform.account(), 'scheduled-reports'],
    queryFn: platformService.getScheduledReports,
  });
};

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to update platform settings
 */
export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<PlatformSettings>) =>
      platformService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.settings() });
    },
  });
};

/**
 * Hook to enable maintenance mode
 */
export const useEnableMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, allowedIps }: { message: string; allowedIps?: string[] }) =>
      platformService.enableMaintenance(message, allowedIps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.settings() });
    },
  });
};

/**
 * Hook to disable maintenance mode
 */
export const useDisableMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformService.disableMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.settings() });
    },
  });
};

// =============================================================================
// Wallet Operations
// =============================================================================

/**
 * Hook to transfer to cold wallet
 */
export const useTransferToColdWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currency, amount }: { currency: string; amount: string }) =>
      platformService.transferToColdWallet(currency, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.balance() });
    },
  });
};

/**
 * Hook to transfer to hot wallet
 */
export const useTransferToHotWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currency, amount }: { currency: string; amount: string }) =>
      platformService.transferToHotWallet(currency, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.balance() });
    },
  });
};

/**
 * Hook to withdraw fees
 */
export const useWithdrawFees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      currency,
      amount,
      destinationAddress,
    }: {
      currency: string;
      amount: string;
      destinationAddress: string;
    }) => platformService.withdrawFees(currency, amount, destinationAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.balance() });
    },
  });
};

// =============================================================================
// Reports
// =============================================================================

/**
 * Hook to generate a platform report
 */
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (params: {
      type: 'transactions' | 'users' | 'revenue' | 'audit';
      dateFrom: string;
      dateTo: string;
      format: 'csv' | 'pdf';
    }) => platformService.generateReport(params),
    onSuccess: (blob, { type, format }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

/**
 * Hook to create a scheduled report
 */
export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformService.createScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.platform.account(), 'scheduled-reports'],
      });
    },
  });
};

/**
 * Hook to delete a scheduled report
 */
export const useDeleteScheduledReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformService.deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.platform.account(), 'scheduled-reports'],
      });
    },
  });
};
