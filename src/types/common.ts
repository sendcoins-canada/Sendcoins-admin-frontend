/**
 * Common Types
 * Shared types used across the application
 */

// =============================================================================
// API Responses
// =============================================================================

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API error response
 */
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

/**
 * API success response
 */
export interface ApiSuccess<T = void> {
  success: true;
  message?: string;
  data?: T;
}

// =============================================================================
// Sorting & Pagination
// =============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: SortDirection;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Query options (pagination + sorting)
 */
export interface QueryOptions extends PaginationOptions {
  sort?: SortOptions;
}

// =============================================================================
// Misc
// =============================================================================

/**
 * Date range
 */
export interface DateRange {
  from: string;
  to: string;
}

/**
 * Select option (for dropdowns)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// =============================================================================
// Audit
// =============================================================================

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

/**
 * Audit log filters
 */
export interface AuditFilters {
  adminId?: string;
  action?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Filters for audit log list (action + search) */
export type AuditLogFilters = Pick<AuditFilters, 'action'> & { search?: string };

// =============================================================================
// Export
// =============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

/**
 * Export request
 */
export interface ExportRequest {
  format: ExportFormat;
  filters?: Record<string, unknown>;
  fields?: string[];
}

// =============================================================================
// Platform
// =============================================================================

/**
 * Platform wallet balance
 */
export interface PlatformBalance {
  currency: string;
  balance: number;
  balanceUsd: number;
  pendingIn: number;
  pendingOut: number;
}

/**
 * Revenue report
 */
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalRevenueUsd: number;
  transactionCount: number;
  byCurrency: Array<{
    currency: string;
    revenue: number;
    revenueUsd: number;
    count: number;
  }>;
  byType: Array<{
    type: string;
    revenue: number;
    revenueUsd: number;
    count: number;
  }>;
}

/**
 * Platform settings
 */
export interface PlatformSettings {
  maintenanceMode: boolean;
  conversionFeePercent: number;
  transferFeePercent: number;
  minWithdrawal: Record<string, number>;
  maxWithdrawal: Record<string, number>;
  supportedCurrencies: string[];
  supportedNetworks: string[];
}
