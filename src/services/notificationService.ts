/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { api } from '../lib/api';
import type {
  Notification,
  NotificationCounts,
  NotificationFilters,
} from '../types/notification';
import type { PaginatedResponse } from '../types/common';

// =============================================================================
// Notification Service
// =============================================================================

export const notificationService = {
  /**
   * Get paginated list of notifications (backend returns { data, pagination })
   */
  getNotifications: async (
    filters?: NotificationFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', {
      params: filters,
    });
    return (response as PaginatedResponse<Notification>) ?? { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  },

  /**
   * Get notification counts (backend returns { total, unread, byCategory })
   */
  getCounts: async (): Promise<NotificationCounts> => {
    const response = await api.get<NotificationCounts>('/notifications/count');
    return (response as NotificationCounts) ?? { total: 0, unread: 0, byCategory: {} };
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await api.patch('/notifications/read', { notificationIds: [id] });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete('/notifications', { data: { notificationIds: [id] } });
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<void> => {
    // Note: Backend doesn't have clear-all, delete all individually via bulk delete
    await api.delete('/notifications', { data: { notificationIds: [] } });
  },

  /**
   * Get notification preferences (backend returns object directly)
   */
  getPreferences: async (): Promise<{
    email: boolean;
    push: boolean;
    categories: Record<string, boolean>;
  }> => {
    try {
      const response = await api.get<{ email: boolean; push: boolean; categories: Record<string, boolean> }>('/notifications/preferences');
      return (response as { email: boolean; push: boolean; categories: Record<string, boolean> }) ?? { email: true, push: true, categories: {} };
    } catch {
      return { email: true, push: true, categories: {} };
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: {
    email?: boolean;
    push?: boolean;
    categories?: Record<string, boolean>;
  }): Promise<void> => {
    await api.patch('/notifications/preferences', preferences);
  },
};

export default notificationService;
