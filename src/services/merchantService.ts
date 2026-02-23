/**
 * Merchant Service
 * Admin management of P2P merchants
 */

import { api } from '../lib/api';

export interface Merchant {
  id: number;
  keychain: string;
  userName: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankCode: string;
  verificationStatus: string;
  verificationDate: number | null;
  verifiedByAdmin: string | null;
  verificationNotes: string | null;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  isActive: boolean;
  ipAddress?: string;
  device?: string;
  createdAt: number;
  updatedAt: number | null;
}

export interface MerchantStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  active: number;
  totalOrders: number;
  completedOrders: number;
}

export interface MerchantTransaction {
  id: number;
  reference: string;
  keychain: string;
  assetType: string;
  optionType: string;
  transactionType: string;
  cryptoSign: string;
  cryptoAmount: number;
  currencySign: string;
  currencyAmount: number;
  exchangeRate: number;
  paymentMethod: string;
  status: string;
  createdAt: number;
}

export const merchantService = {
  /**
   * Get all merchants with pagination and filters
   */
  getMerchants: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    active?: boolean;
  }) => {
    const response = await api.get<{
      merchants: Merchant[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/merchants', { params });
    return response;
  },

  /**
   * Get merchant statistics
   */
  getStats: async (): Promise<MerchantStats> => {
    try {
      const response = await api.get<MerchantStats>('/merchants/stats');
      return response;
    } catch {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
        active: 0,
        totalOrders: 0,
        completedOrders: 0,
      };
    }
  },

  /**
   * Get a single merchant by keychain
   */
  getMerchant: async (keychain: string): Promise<Merchant | null> => {
    try {
      const response = await api.get<Merchant>(`/merchants/${keychain}`);
      return response;
    } catch {
      return null;
    }
  },

  /**
   * Get merchant's transaction history
   */
  getMerchantTransactions: async (
    keychain: string,
    params?: { page?: number; limit?: number }
  ) => {
    const response = await api.get<{
      transactions: MerchantTransaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/merchants/${keychain}/transactions`, { params });
    return response;
  },

  /**
   * Approve a merchant
   */
  approve: async (keychain: string, notes?: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      `/merchants/${keychain}/approve`,
      { notes }
    );
    return response;
  },

  /**
   * Reject a merchant
   */
  reject: async (keychain: string, reason: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      `/merchants/${keychain}/reject`,
      { reason }
    );
    return response;
  },

  /**
   * Suspend a merchant
   */
  suspend: async (keychain: string, reason: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      `/merchants/${keychain}/suspend`,
      { reason }
    );
    return response;
  },

  /**
   * Toggle merchant active status
   */
  toggleStatus: async (
    keychain: string,
    isActive: boolean
  ): Promise<{ success: boolean; isActive: boolean }> => {
    const response = await api.post<{ success: boolean; isActive: boolean }>(
      `/merchants/${keychain}/toggle`,
      { isActive }
    );
    return response;
  },
};
