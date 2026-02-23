/**
 * Dashboard Service
 * Calls /dashboard/overview and /dashboard/pending
 */

import { api } from '../lib/api';

export interface DashboardOverview {
  users?: { total: number; active: number; suspended: number; newThisMonth?: number; newThisWeek?: number };
  transactions?: { total: number; completed: number; pending: number; failed: number; flagged: number };
  platform?: unknown;
  kyc?: unknown;
  recentActivity?: unknown[];
}

export interface DashboardPending {
  pendingKyc?: number;
  pendingTransactions?: number;
  flaggedTransactions?: number;
}

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    try {
      const response = await api.get<DashboardOverview>('/dashboard/overview');
      return (response as DashboardOverview) ?? {};
    } catch {
      return {};
    }
  },

  getPending: async (): Promise<DashboardPending> => {
    try {
      const response = await api.get<DashboardPending>('/dashboard/pending');
      return (response as DashboardPending) ?? {};
    } catch {
      return {};
    }
  },
};
