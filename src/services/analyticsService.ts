/**
 * Analytics Service
 * GET /analytics/transactions, /analytics/users, /analytics/revenue, /analytics/top-users
 */

import { api } from '../lib/api';

export interface AnalyticsDateParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export const analyticsService = {
  getTransactionAnalytics: async (params?: AnalyticsDateParams) => {
    try {
      return await api.get<Record<string, unknown>>('/analytics/transactions', { params });
    } catch {
      return {};
    }
  },

  getUserAnalytics: async (params?: AnalyticsDateParams) => {
    try {
      return await api.get<Record<string, unknown>>('/analytics/users', { params });
    } catch {
      return {};
    }
  },

  getRevenueAnalytics: async (params?: AnalyticsDateParams) => {
    try {
      return await api.get<Record<string, unknown>>('/analytics/revenue', { params });
    } catch {
      return {};
    }
  },

  getTopUsers: async (params?: { limit?: number; metric?: 'transactions' | 'volume' }) => {
    try {
      return await api.get<unknown[] | { users?: unknown[] }>('/analytics/top-users', { params });
    } catch {
      return [];
    }
  },
};
