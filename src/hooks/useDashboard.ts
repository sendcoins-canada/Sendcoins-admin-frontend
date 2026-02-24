/**
 * Dashboard Hooks
 * React Query hooks for dashboard overview and pending counts
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { queryKeys } from '../lib/queryClient';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: () => dashboardService.getOverview(),
    staleTime: 60 * 1000,
  });
};

export const useDashboardPending = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.pending(),
    queryFn: () => dashboardService.getPending(),
    staleTime: 60 * 1000,
  });
};
