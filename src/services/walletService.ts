/**
 * Wallet Service
 * GET /wallets, /wallets/stats, /wallets/user/:userId
 * POST /wallets/:crypto/:walletId/freeze, /unfreeze
 * POST /wallets/user/:userId/freeze-all, /unfreeze-all
 */

import { api } from '../lib/api';

export const walletService = {
  getWallets: async (params?: {
    page?: number;
    limit?: number;
    crypto?: string;
    userId?: number;
    frozen?: boolean | string;
    address?: string;
  }) => {
    const p = { ...params };
    if (typeof p.frozen === 'boolean') p.frozen = p.frozen ? 'true' : 'false';
    const response = await api.get<{ data?: unknown[]; wallets?: unknown[]; pagination?: unknown }>('/wallets', { params: p });
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

  freezeWallet: async (crypto: string, walletId: number, reason?: string): Promise<void> => {
    await api.post(`/wallets/${encodeURIComponent(crypto)}/${walletId}/freeze`, { reason: reason ?? 'Admin freeze' });
  },

  unfreezeWallet: async (crypto: string, walletId: number): Promise<void> => {
    await api.post(`/wallets/${encodeURIComponent(crypto)}/${walletId}/unfreeze`);
  },

  freezeAllUserWallets: async (userId: string, reason?: string): Promise<void> => {
    await api.post(`/wallets/user/${userId}/freeze-all`, { reason: reason ?? 'Admin freeze all' });
  },

  unfreezeAllUserWallets: async (userId: string): Promise<void> => {
    await api.post(`/wallets/user/${userId}/unfreeze-all`);
  },
};
