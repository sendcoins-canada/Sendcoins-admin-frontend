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

export const auditLogService = {
  /**
   * Get paginated list of audit logs
   */
  getLogs: async (
    filters?: AuditLogFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get audit log by ID
   */
  getLog: async (id: string): Promise<AuditLog> => {
    const response = await api.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  },

  /**
   * Get audit logs for a specific admin
   */
  getAdminLogs: async (
    adminId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<PaginatedResponse<AuditLog>>(
      `/audit-logs/admin/${adminId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get audit logs for a specific resource
   */
  getResourceLogs: async (
    resourceType: string,
    resourceId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<PaginatedResponse<AuditLog>>(
      `/audit-logs/resource/${resourceType}/${resourceId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Export audit logs to CSV
   */
  exportLogs: async (filters?: AuditLogFilters): Promise<Blob> => {
    const response = await api.get('/audit-logs/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default auditLogService;
