/**
 * KYC Queue Service
 * GET /kyc (list), GET /kyc/stats
 */

import { api } from '../lib/api';

export const kycQueueService = {
  getList: async (params?: { page?: number; limit?: number; status?: string; search?: string; country?: string }) => {
    const response = await api.get<{ users?: unknown[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>('/kyc', { params });
    const users = (response as { users?: unknown[] })?.users ?? [];
    const pagination = (response as { pagination?: unknown })?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
    return { data: users, pagination };
  },

  getStats: async () => {
    try {
      return await api.get<Record<string, number>>('/kyc/stats');
    } catch {
      return {};
    }
  },
};
