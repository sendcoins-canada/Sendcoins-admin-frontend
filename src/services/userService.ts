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
   * Freeze user account (backend may use wallets freeze-all; 404 = not implemented)
   */
  freezeUser: async (id: string, reason: string): Promise<void> => {
    try {
      await api.post(`/users/${id}/freeze`, { reason });
    } catch (e) {
      throw new Error((e as Error)?.message ?? 'Freeze not available. Backend may require wallet freeze.');
    }
  },

  /**
   * Unfreeze user account (backend may use wallets unfreeze; 404 = not implemented)
   */
  unfreezeUser: async (id: string): Promise<void> => {
    try {
      await api.post(`/users/${id}/unfreeze`);
    } catch (e) {
      throw new Error((e as Error)?.message ?? 'Unfreeze not available.');
    }
  },

  /**
   * Close user account (404 = not implemented)
   */
  closeAccount: async (id: string, reason: string): Promise<void> => {
    try {
      await api.post(`/users/${id}/close`, { reason });
    } catch (e) {
      throw new Error((e as Error)?.message ?? 'Close account not available.');
    }
  },

  // =========================================================================
  // KYC Management (backend: /kyc/:userId)
  // =========================================================================

  /**
   * Get user's KYC details (backend GET /kyc/:userId)
   */
  getKycDocuments: async (userId: string): Promise<KycDocument[]> => {
    try {
      const response = await api.get<{ documents?: KycDocument[] } | KycDocument[] | Record<string, unknown>>(`/kyc/${userId}`);
      if (Array.isArray(response)) return response;
      const doc = (response as { documents?: KycDocument[] })?.documents;
      if (doc?.length) return doc;
      // Backend returns single KYC details object (e.g. { userId, kycStatus, verification: { verificationId, submittedAt } })
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        const obj = response as Record<string, unknown>;
        const verification = obj.verification as { verificationId?: string; submittedAt?: string } | undefined;
        const kycStatus = (obj.kycStatus as string) || (obj.verify_user ? 'verified' : 'pending');
        const status = kycStatus === 'verified' ? 'APPROVED' : kycStatus === 'rejected' ? 'REJECTED' : 'PENDING';
        return [
          {
            id: (verification?.verificationId as string) || `kyc-${userId}`,
            type: 'Identity Verification',
            status: status as 'PENDING' | 'APPROVED' | 'REJECTED',
            uploadedAt: verification?.submittedAt || (obj.createdAt as string) || (obj.timestamp as string) || '',
          } as KycDocument,
        ];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Approve KYC for user (backend POST /kyc/:userId/approve - user-level)
   */
  approveKyc: async (userId: string, _documentId?: string): Promise<void> => {
    await api.post(`/kyc/${userId}/approve`, {});
  },

  /**
   * Reject KYC for user (backend POST /kyc/:userId/reject)
   */
  rejectKyc: async (userId: string, _documentId: string, reason: string): Promise<void> => {
    await api.post(`/kyc/${userId}/reject`, { reason });
  },

  /**
   * Request additional KYC documents (backend may not implement)
   */
  requestKycDocuments: async (
    userId: string,
    documentTypes: string[],
    message?: string
  ): Promise<void> => {
    try {
      await api.post(`/kyc/${userId}/request`, { documentTypes, message });
    } catch {
      // Backend may not have this endpoint
    }
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.get(`/users/${userId}/activity`, { params });
      const activities = response.data || response.activities || [];
      const meta = response.meta || response.pagination || {};
      const total = meta.total ?? response.total ?? activities.length;
      const page = meta.page ?? response.page ?? params?.page ?? 1;
      const limit = meta.limit ?? response.limit ?? params?.limit ?? 10;
      const totalPages = meta.totalPages ?? response.totalPages ?? Math.ceil(total / limit);
      return {
        data: Array.isArray(activities) ? activities : [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch {
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  },

  /**
   * Get user's login history (backend may not implement)
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
    try {
      const response = await api.get(`/users/${userId}/login-history`);
      return (response as Array<{
        id: string;
        ip: string;
        device: string;
        location: string;
        timestamp: string;
        success: boolean;
      }>) || [];
    } catch {
      return [];
    }
  },

  // =========================================================================
  // User Notes
  // =========================================================================

  /**
   * Add note to user (backend may not implement)
   */
  addNote: async (userId: string, note: string): Promise<void> => {
    try {
      await api.post(`/users/${userId}/notes`, { note });
    } catch (e) {
      throw new Error((e as Error)?.message ?? 'Notes not available.');
    }
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
    try {
      const response = await api.get(`/users/${userId}/notes`);
      return (response as Array<{
        id: string;
        note: string;
        adminId: string;
        adminName: string;
        createdAt: string;
      }>) || [];
    } catch {
      return [];
    }
  },

  // =========================================================================
  // Export
  // =========================================================================

  /**
   * Export users to CSV (backend may not implement)
   */
  exportUsers: async (filters?: UserFilters): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/users/export', {
        params: filters,
        responseType: 'blob',
      });
      return response as unknown as Blob;
    } catch (e) {
      throw new Error((e as Error)?.message ?? 'Export not available.');
    }
  },
};

export default userService;
