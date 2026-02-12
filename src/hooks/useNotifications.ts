/**
 * Notification Hooks
 * React Query hooks for notification operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { queryKeys } from '../lib/queryClient';
import type { NotificationFilters } from '../types/notification';

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook to get paginated notifications
 */
export const useNotifications = (
  filters?: NotificationFilters & { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
  });
};

/**
 * Hook to get notification counts
 */
export const useNotificationCounts = () => {
  return useQuery({
    queryKey: queryKeys.notifications.count(),
    queryFn: notificationService.getCounts,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to get notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'preferences'],
    queryFn: notificationService.getPreferences,
  });
};

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to mark a notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Hook to clear all notifications
 */
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.clearAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Hook to update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.notifications.all, 'preferences'],
      });
    },
  });
};
