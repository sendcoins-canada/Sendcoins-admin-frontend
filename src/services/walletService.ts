/**
 * Wallet Service
 * GET /wallets, /wallets/stats, /wallets/user/:userId
 */

import { api } from '../lib/api';

export const walletService = {
  getWallets: async (params?: { page?: number; limit?: number; crypto?: string; userId?: number; frozen?: boolean }) => {
    const response = await api.get<{ data?: unknown[]; wallets?: unknown[]; pagination?: unknown }>('/wallets', { params });
    const list = (response as { data?: unknown[]; wallets?: unknown[] })?.data ?? (response as { wallets?: unknown[] })?.wallets ?? [];
    const pagination = (response as { pagination?: unknown })?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
    return { data: Array.isArray(list) ? list : [], pagination };
  },

  getStats: async () => {
    try {
      return await api.get<Record<string, unknown>>('/wallets/stats');
    } catch {
      return {};
    }
  },

  getWalletsByUser: async (userId: string) => {
    try {
      const response = await api.get<unknown[] | { wallets?: unknown[] }>(`/wallets/user/${userId}`);
      return Array.isArray(response) ? response : (response as { wallets?: unknown[] })?.wallets ?? [];
    } catch {
      return [];
    }
  },
};
