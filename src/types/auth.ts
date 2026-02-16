/**
 * Auth Types
 * Types related to authentication, users, and permissions
 */

// =============================================================================
// Permissions
// =============================================================================

/**
 * All available permissions in the system
 * Must match backend permissions
 */
export type Permission =
  | 'READ_USERS'
  | 'SUSPEND_USERS'
  | 'READ_TRANSACTIONS'
  | 'VERIFY_TRANSACTIONS'
  | 'READ_TX_HASH'
  | 'EXPORT_TRANSACTIONS'
  | 'READ_WALLETS'
  | 'FREEZE_WALLETS'
  | 'READ_AUDIT_LOGS'
  | 'VERIFY_KYC'
  | 'MANAGE_ADMINS'
  | 'MANAGE_ROLES'
  | 'MANAGE_DEPARTMENTS'
  | 'VIEW_DASHBOARD'
  | 'VIEW_ANALYTICS'
  | 'EXPORT_DATA'
  | 'READ_NOTIFICATIONS'
  | 'MANAGE_NOTIFICATION_SETTINGS';

/**
 * Admin roles
 */
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ENGINEER' | 'OPERATOR' | 'SUPPORT' | 'COMPLIANCE';

/**
 * Admin account status
 */
export type AdminStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'LOCKED';

// =============================================================================
// User
// =============================================================================

/**
 * Authenticated admin user
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  roleId: number;
  roleName?: string;
  departmentId: number | null;
  departmentName?: string | null;
  permissions: Permission[];
  mfaEnabled: boolean;
  status: AdminStatus;
  createdAt: string;
  lastLoginAt?: string;
}

// =============================================================================
// Login
// =============================================================================

/**
 * Login request payload
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  requiresMfa: boolean;
  mfaToken?: string;
  message?: string;
}

// =============================================================================
// MFA
// =============================================================================

/**
 * MFA verification request
 */
export interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
}

/**
 * MFA verification response
 */
export interface MfaVerifyResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/**
 * MFA setup response
 */
export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// =============================================================================
// Token
// =============================================================================

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// =============================================================================
// Password
// =============================================================================

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Set new password request (from reset link)
 */
export interface SetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Change password request (when logged in)
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// =============================================================================
// Session
// =============================================================================

/**
 * Active session info
 */
export interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

// =============================================================================
// Auth State (Redux)
// =============================================================================

/**
 * Redux auth state
 */
export interface AuthState {
  // Initialization
  isInitialized: boolean;
  isLoading: boolean;

  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // MFA flow
  requiresMfa: boolean;
  mfaToken: string | null;

  // Error handling
  error: string | null;
}
