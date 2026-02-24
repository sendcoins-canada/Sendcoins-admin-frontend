/**
 * Analytics Service
 * GET /analytics/transactions, /analytics/users, /analytics/revenue, /analytics/top-users
 */

import { api } from '../lib/api';

export interface AnalyticsDateParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  dateRange?: string; // days, e.g. '7', '30'
}

function toStartEnd(dateRangeDays: string): { startDate: string; endDate: string } {
  const days = Math.max(1, parseInt(dateRangeDays, 10) || 30);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export const analyticsService = {
  getTransactionAnalytics: async (params?: AnalyticsDateParams) => {
    try {
      const { startDate, endDate } = params?.dateRange ? toStartEnd(params.dateRange) : { startDate: params?.startDate, endDate: params?.endDate };
      return await api.get<Record<string, unknown>>('/analytics/transactions', {
        params: { startDate, endDate, groupBy: params?.groupBy },
      });
    } catch {
      return {};
    }
  },

  getUserAnalytics: async (params?: AnalyticsDateParams) => {
    try {
      const { startDate, endDate } = params?.dateRange ? toStartEnd(params.dateRange) : { startDate: params?.startDate, endDate: params?.endDate };
      return await api.get<Record<string, unknown>>('/analytics/users', {
        params: { startDate, endDate, groupBy: params?.groupBy },
      });
    } catch {
      return {};
    }
  },

  getRevenueAnalytics: async (params?: AnalyticsDateParams) => {
    try {
      const { startDate, endDate } = params?.dateRange ? toStartEnd(params.dateRange) : { startDate: params?.startDate, endDate: params?.endDate };
      return await api.get<Record<string, unknown>>('/analytics/revenue', {
        params: { startDate, endDate, groupBy: params?.groupBy },
      });
    } catch {
      return {};
    }
  },

  getTopUsers: async (params?: { limit?: number; metric?: 'transactions' | 'volume' }) => {
    try {
      const res = await api.get<unknown[] | { users?: unknown[]; data?: unknown[] }>('/analytics/top-users', { params });
      return Array.isArray(res) ? res : (res?.users ?? res?.data ?? []);
    } catch {
      return [];
    }
  },
};
