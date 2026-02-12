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
   * Get paginated list of notifications
   */
  getNotifications: async (
    filters?: NotificationFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get notification counts
   */
  getCounts: async (): Promise<NotificationCounts> => {
    const response = await api.get<NotificationCounts>('/notifications/count');
    return response.data;
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
   * Get notification preferences
   */
  getPreferences: async (): Promise<{
    email: boolean;
    push: boolean;
    categories: Record<string, boolean>;
  }> => {
    const response = await api.get('/notifications/preferences');
    return response.data;
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
