/**
 * Notification Types
 * Types related to admin notifications
 */

// =============================================================================
// Enums
// =============================================================================

/**
 * Notification type
 */
export type NotificationType =
  | 'LOGIN'
  | 'SUSPICIOUS_ACTIVITY'
  | 'USER_REPORT'
  | 'LARGE_TRANSACTION'
  | 'SYSTEM_ALERT'
  | 'KYC_PENDING'
  | 'TRANSACTION_FLAGGED'
  | 'ROLE_CHANGED'
  | 'ADMIN_ACTION';

/**
 * Notification category
 */
export type NotificationCategory =
  | 'SECURITY'
  | 'TRANSACTION'
  | 'USER'
  | 'SYSTEM'
  | 'COMPLIANCE';

/**
 * Notification priority
 */
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

// =============================================================================
// Notification
// =============================================================================

/**
 * Notification record
 */
export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// =============================================================================
// Counts & Filters
// =============================================================================

/**
 * Notification counts
 */
export interface NotificationCounts {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
}

/**
 * Notification filters
 */
export interface NotificationFilters {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
