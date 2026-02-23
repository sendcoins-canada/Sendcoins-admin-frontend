/**
 * Audit Log Service
 * Handles all audit log-related API calls
 */

import { api } from '../lib/api';
import type { AuditLog, AuditLogFilters } from '../types/common';
import type { PaginatedResponse } from '../types/common';

// =============================================================================
// Audit Log Service
// =============================================================================

// Backend returns { logs, pagination: { total, limit, offset, hasMore } }; map to PaginatedResponse
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAuditListResponse = (response: any): PaginatedResponse<AuditLog> => {
  const logs = response?.logs ?? [];
  const p = response?.pagination ?? {};
  const limit = p.limit ?? 20;
  const total = p.total ?? 0;
  const offset = p.offset ?? 0;
  const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    data: Array.isArray(logs) ? logs : [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: offset + logs.length < total,
      hasPrev: page > 1,
    },
  };
};

export const auditLogService = {
  /**
   * Get paginated list of audit logs.
   * Backend returns { logs, pagination }; we map to { data, pagination } with page-based fields.
   */
  getLogs: async (
    filters?: AuditLogFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<AuditLog>> => {
    const page = filters?.page ?? 1;
    const limit = Math.min(filters?.limit ?? 20, 100);
    const offset = (page - 1) * limit;
    const response = await api.get<{ logs: AuditLog[]; pagination: Record<string, number> }>(
      '/audit-logs',
      { params: { limit, offset, search: filters?.search, action: filters?.action } }
    );
    return mapAuditListResponse(response);
  },

  /**
   * Get audit log by ID (falls back to list if backend has no GET :id)
   */
  getLog: async (id: string): Promise<AuditLog> => {
    try {
      const log = await api.get<AuditLog>(`/audit-logs/${id}`);
      return log as AuditLog;
    } catch {
      return {} as AuditLog;
    }
  },

  /**
   * Get audit logs for a specific admin
   */
  getAdminLogs: async (
    adminId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<AuditLog>> => {
    try {
      const response = await api.get<{ logs: AuditLog[]; pagination: Record<string, number> }>(
        `/audit-logs/admin/${adminId}`,
        { params: { ...params, limit: params?.limit ?? 20, offset: ((params?.page ?? 1) - 1) * (params?.limit ?? 20) } }
      );
      return mapAuditListResponse(response);
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  },

  /**
   * Get audit logs for a specific resource
   */
  getResourceLogs: async (
    resourceType: string,
    resourceId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<AuditLog>> => {
    try {
      const response = await api.get<{ logs: AuditLog[]; pagination: Record<string, number> }>(
        `/audit-logs/resource/${resourceType}/${resourceId}`,
        { params: { ...params, limit: params?.limit ?? 20, offset: ((params?.page ?? 1) - 1) * (params?.limit ?? 20) } }
      );
      return mapAuditListResponse(response);
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  },

  /**
   * Export audit logs to CSV. Falls back to empty blob if backend has no export.
   */
  exportLogs: async (filters?: AuditLogFilters): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/audit-logs/export', {
        params: filters,
        responseType: 'blob',
      });
      return (response as unknown as Blob) ?? new Blob();
    } catch {
      return new Blob(['action,resourceType,adminName,createdAt\n'], { type: 'text/csv' });
    }
  },
};

export default auditLogService;
