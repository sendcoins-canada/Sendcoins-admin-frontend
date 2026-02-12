/**
 * User Service
 * Handles all platform user-related API calls
 */

import { api } from '../lib/api';
import type {
  PlatformUser,
  UserDetail,
  UserFilters,
  UserStats,
  KycDocument,
  UserActivity,
} from '../types/user';
import type { PaginatedResponse } from '../types/common';

// =============================================================================
// User Service
// =============================================================================

// Helper to map backend user to frontend format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUser = (user: any): PlatformUser => ({
  id: String(user.azer_id),
  email: user.user_email,
  firstName: user.first_name || '',
  lastName: user.last_name || '',
  fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  phone: user.phone || undefined,
  country: user.country || '',
  accountType: user.company_name ? 'BUSINESS' : 'PERSONAL',
  kycStatus: user.verify_user ? 'VERIFIED' : 'PENDING',
  status: user.account_ban === 'true' ? 'BANNED' : 'ACTIVE',
  walletCount: user.walletCount || 0,
  totalBalance: user.totalBalance || 0,
  transactionCount: user.transactionCount || 0,
  lastActivity: user.last_login_at || user.timestamp,
  createdAt: user.timestamp,
  updatedAt: user.timestamp,
});

export const userService = {
  /**
   * Get paginated list of users with filters
   */
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<PlatformUser>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get('/users', {
      params: filters,
    });
    // Map backend response to frontend format
    // Backend returns: { users: [...], pagination: { page, limit, total, totalPages } }
    const users = (response.users || response.data || []).map(mapUser);
    const pagination = response.pagination || {};
    const total = pagination.total || users.length;
    const page = pagination.page || filters?.page || 1;
    const limit = pagination.limit || filters?.limit || 20;
    const totalPages = pagination.totalPages || Math.ceil(total / limit);
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get user by ID with full details
   */
  getUser: async (id: string): Promise<UserDetail> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`/users/${id}`);
    const user = response.user || response;
    return {
      ...mapUser(user),
      mfaEnabled: user.device_security === 'on',
      emailVerified: user.verify_user || false,
      phoneVerified: !!user.phone,
      wallets: user.wallets || [],
      bankAccounts: user.bankAccounts || [],
    };
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get('/users/stats');
    return {
      total: response.total || response.totalUsers || 0,
      active: response.active || response.activeUsers || 0,
      suspended: response.suspended || response.suspendedUsers || 0,
      banned: response.banned || response.bannedUsers || 0,
      pendingKyc: response.pendingKyc || response.pendingKycUsers || 0,
      verifiedKyc: response.verifiedKyc || response.verifiedKycUsers || 0,
    };
  },

  /**
   * Suspend a user
   */
  suspendUser: async (id: string, reason: string): Promise<void> => {
    await api.post(`/users/${id}/suspend`, { reason });
  },

  /**
   * Unsuspend a user
   */
  unsuspendUser: async (id: string): Promise<void> => {
    await api.post(`/users/${id}/unsuspend`);
  },

  /**
   * Freeze user account (block all transactions)
   */
  freezeUser: async (id: string, reason: string): Promise<void> => {
    await api.post(`/users/${id}/freeze`, { reason });
  },

  /**
   * Unfreeze user account
   */
  unfreezeUser: async (id: string): Promise<void> => {
    await api.post(`/users/${id}/unfreeze`);
  },

  /**
   * Close user account
   */
  closeAccount: async (id: string, reason: string): Promise<void> => {
    await api.post(`/users/${id}/close`, { reason });
  },

  // =========================================================================
  // KYC Management
  // =========================================================================

  /**
   * Get user's KYC documents
   */
  getKycDocuments: async (userId: string): Promise<KycDocument[]> => {
    const response = await api.get(`/users/${userId}/kyc`);
    return (response as KycDocument[]) || [];
  },

  /**
   * Approve KYC document
   */
  approveKyc: async (userId: string, documentId: string): Promise<void> => {
    await api.post(`/users/${userId}/kyc/${documentId}/approve`);
  },

  /**
   * Reject KYC document
   */
  rejectKyc: async (userId: string, documentId: string, reason: string): Promise<void> => {
    await api.post(`/users/${userId}/kyc/${documentId}/reject`, { reason });
  },

  /**
   * Request additional KYC documents
   */
  requestKycDocuments: async (
    userId: string,
    documentTypes: string[],
    message?: string
  ): Promise<void> => {
    await api.post(`/users/${userId}/kyc/request`, { documentTypes, message });
  },

  // =========================================================================
  // User Activity
  // =========================================================================

  /**
   * Get user's activity log
   */
  getUserActivity: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<UserActivity>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.get(`/users/${userId}/activity`, { params });
    const activities = response.data || response.activities || response || [];
    const total = response.total || activities.length;
    const page = response.page || params?.page || 1;
    const limit = response.limit || params?.limit || 10;
    const totalPages = response.totalPages || Math.ceil(total / limit);
    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get user's login history
   */
  getLoginHistory: async (
    userId: string
  ): Promise<
    Array<{
      id: string;
      ip: string;
      device: string;
      location: string;
      timestamp: string;
      success: boolean;
    }>
  > => {
    const response = await api.get(`/users/${userId}/login-history`);
    return (response as Array<{
      id: string;
      ip: string;
      device: string;
      location: string;
      timestamp: string;
      success: boolean;
    }>) || [];
  },

  // =========================================================================
  // User Notes
  // =========================================================================

  /**
   * Add note to user
   */
  addNote: async (userId: string, note: string): Promise<void> => {
    await api.post(`/users/${userId}/notes`, { note });
  },

  /**
   * Get user notes
   */
  getNotes: async (
    userId: string
  ): Promise<
    Array<{
      id: string;
      note: string;
      adminId: string;
      adminName: string;
      createdAt: string;
    }>
  > => {
    const response = await api.get(`/users/${userId}/notes`);
    return (response as Array<{
      id: string;
      note: string;
      adminId: string;
      adminName: string;
      createdAt: string;
    }>) || [];
  },

  // =========================================================================
  // Export
  // =========================================================================

  /**
   * Export users to CSV
   */
  exportUsers: async (filters?: UserFilters): Promise<Blob> => {
    const response = await api.get('/users/export', {
      params: filters,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};

export default userService;
