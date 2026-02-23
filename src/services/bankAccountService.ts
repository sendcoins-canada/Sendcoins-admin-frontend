/**
 * Fiat (Bank) Account Service
 * Admin view of user fiat accounts (CrayFi wallet_accounts)
 */

import { api } from '../lib/api';

export interface FiatAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  currency: string;
  availableBalance: number;
  lockedBalance: number;
  actualBalance: number;
  userId: number;
  userEmail: string;
  userName: string;
  createdAt: string;
}

export interface BankAccountStats {
  total: number;
  uniqueUsers: number;
  countries: number;
  banks: number;
}

export const bankAccountService = {
  getAccounts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    currency?: string;
  }) => {
    const response = await api.get<{
      accounts: FiatAccount[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/bank-accounts', { params });
    return response;
  },

  getStats: async (): Promise<BankAccountStats> => {
    try {
      const response = await api.get<BankAccountStats>('/bank-accounts/stats');
      return response;
    } catch {
      return { total: 0, uniqueUsers: 0, countries: 0, banks: 0 };
    }
  },

  getAccount: async (id: string): Promise<FiatAccount | null> => {
    try {
      const response = await api.get<FiatAccount>(`/bank-accounts/${id}`);
      return response;
    } catch {
      return null;
    }
  },

  getUserAccounts: async (userId: number): Promise<FiatAccount[]> => {
    try {
      const response = await api.get<FiatAccount[]>(`/bank-accounts/user/${userId}`);
      return response || [];
    } catch {
      return [];
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/bank-accounts/${id}`);
  },
};
