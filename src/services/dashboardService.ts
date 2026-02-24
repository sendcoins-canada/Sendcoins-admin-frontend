/**
 * Dashboard Service
 * Calls /dashboard/overview and /dashboard/pending
 */

import { api } from '../lib/api';

export interface DashboardOverview {
  users?: {
    total: number;
    active: number;
    suspended: number;
    newThisMonth?: number;
    newThisWeek?: number;
  };
  transactions?: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    flagged: number;
    totalCryptoVolume?: string;
    totalFiatVolume?: string;
    thisMonth?: number;
    thisWeek?: number;
    today?: number;
  };
  platform?: {
    feeWalletBalance?: string;
    hotWalletBalance?: string;
    monthlyRevenue?: string;
  };
  kyc?: {
    total: number;
    verified: number;
    pending: number;
    verificationRate?: string;
  };
  recentActivity?: Array<{ id: number; action: string; adminName: string; timestamp: string; details?: unknown }>;
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
