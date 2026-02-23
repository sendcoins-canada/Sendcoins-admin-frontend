/**
 * Audit Log Hooks
 * React Query hooks for audit log operations
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auditLogService } from '../services/auditLogService';
import { queryKeys } from '../lib/queryClient';
import type { AuditLogFilters } from '../types/common';

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook to get paginated audit logs
 */
export const useAuditLogs = (
  filters?: AuditLogFilters & { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: () => auditLogService.getLogs(filters),
  });
};

/**
 * Hook to get a single audit log
 */
export const useAuditLog = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.auditLogs.all, id],
    queryFn: () => auditLogService.getLog(id),
    enabled: !!id,
  });
};

/**
 * Hook to get audit logs for a specific admin
 */
export const useAdminAuditLogs = (
  adminId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: [...queryKeys.auditLogs.all, 'admin', adminId, params],
    queryFn: () => auditLogService.getAdminLogs(adminId, params),
    enabled: !!adminId,
  });
};

/**
 * Hook to get audit logs for a specific resource
 */
export const useResourceAuditLogs = (
  resourceType: string,
  resourceId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: [...queryKeys.auditLogs.all, 'resource', resourceType, resourceId, params],
    queryFn: () => auditLogService.getResourceLogs(resourceType, resourceId, params),
    enabled: !!resourceType && !!resourceId,
  });
};

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to export audit logs
 */
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (filters?: AuditLogFilters) => auditLogService.exportLogs(filters),
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to export audit logs');
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
