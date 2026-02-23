/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import { api } from '../lib/api';
import type {
  User,
  LoginCredentials,
  LoginResponse,
  MfaVerifyRequest,
  ChangePasswordRequest,
  MfaSetupResponse,
} from '../types/auth';

// =============================================================================
// Auth Service
// =============================================================================

export const authService = {
  /**
   * Login with email and password
   * Returns user data or MFA requirement
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.post('/auth/admin/login', credentials);
    // Support both direct body and wrapped { data } (e.g. from some proxies)
    const body = response?.data ?? response;

    // Check if MFA is required (backend returns tempToken without admin data)
    if (body.requiresMfa && body.tempToken) {
      return {
        success: true,
        requiresMfa: true,
        mfaToken: body.tempToken, // Map backend's tempToken to frontend's mfaToken
      };
    }

    // Validate response has admin data
    const admin = body.admin;
    if (!admin) {
      throw new Error('Invalid response from server');
    }

    const accessToken = body.accessToken;
    const refreshToken = body.refreshToken;
    if (!accessToken) {
      throw new Error('Invalid response from server');
    }

    // Map backend response to frontend expected format
    return {
      success: true,
      user: {
        id: String(admin.id),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        roleId: admin.roleId,
        roleName: admin.dynamicRole?.title,
        departmentId: admin.departmentId,
        departmentName: admin.department?.name,
        permissions: admin.dynamicRole?.permissions || [],
        mfaEnabled: admin.mfaEnabled || false,
        status: admin.status,
        createdAt: admin.createdAt || new Date().toISOString(),
        lastLoginAt: admin.lastLoginAt,
      },
      token: accessToken,
      refreshToken,
      requiresMfa: false,
    };
  },

  /**
   * Verify MFA code
   */
  verifyMfa: async (data: MfaVerifyRequest): Promise<LoginResponse> => {
    // Map frontend's mfaToken to backend's expected tempToken
    const backendPayload = {
      tempToken: data.mfaToken,
      code: data.code,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.post('/auth/admin/verify-mfa', backendPayload);
    // Support both direct body and wrapped { data } (e.g. from some proxies)
    const body = response?.data ?? response;
    // Map backend response to frontend expected format
    const admin = body.admin;
    return {
      success: true,
      user: {
        id: String(admin.id),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        roleId: admin.roleId,
        roleName: admin.dynamicRole?.title,
        departmentId: admin.departmentId,
        departmentName: admin.department?.name,
        permissions: admin.dynamicRole?.permissions || [],
        mfaEnabled: admin.mfaEnabled || false,
        status: admin.status,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt,
      },
      token: body.accessToken,
      refreshToken: body.refreshToken,
      requiresMfa: false,
    };
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    // Response is already unwrapped by axios interceptor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin: any = await api.get('/auth/admin/me');
    // Map backend response to frontend expected format
    return {
      id: String(admin.id),
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      roleId: admin.roleId,
      roleName: admin.dynamicRole?.title,
      departmentId: admin.departmentId,
      departmentName: admin.department?.name,
      permissions: admin.dynamicRole?.permissions || [],
      mfaEnabled: admin.mfaEnabled || false,
      status: admin.status,
      createdAt: admin.createdAt,
      lastLoginAt: admin.lastLoginAt,
    };
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/admin/logout');
    } catch {
      // Ignore logout errors - we'll clear local state anyway
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await api.post('/auth/admin/refresh');
    return { token: response.accessToken };
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/auth/admin/change-password', data);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/admin/forgot-password', { email });
  },

  /**
   * Validate password setup/reset token (call before showing password form)
   */
  validatePasswordToken: async (token: string): Promise<{ valid: boolean; email?: string }> => {
    const response = await api.post<{ valid: boolean; email?: string }>('/auth/admin/validate-password-token', { token });
    return response as { valid: boolean; email?: string };
  },

  /**
   * Set or reset password with token (backend expects newPassword + confirmPassword)
   */
  setPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> => {
    await api.post('/auth/admin/set-password', {
      token,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * @deprecated Use setPassword with confirmPassword. Kept for compatibility.
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/admin/set-password', {
      token,
      newPassword,
      confirmPassword: newPassword,
    });
  },

  // =========================================================================
  // MFA Management
  // =========================================================================

  /**
   * Setup MFA - get QR code and secret
   */
  setupMfa: async (): Promise<MfaSetupResponse> => {
    const response = await api.post<MfaSetupResponse>('/auth/admin/mfa/start-setup');
    return response as unknown as MfaSetupResponse;
  },

  /**
   * Enable MFA after setup. Returns backup codes (show once in modal).
   */
  enableMfa: async (code: string): Promise<{ backupCodes: string[] }> => {
    const res = await api.post<{ backupCodes?: string[] }>('/auth/admin/mfa/enable', { code });
    return { backupCodes: (res as { backupCodes?: string[] })?.backupCodes ?? [] };
  },

  /**
   * Disable MFA
   */
  disableMfa: async (code: string): Promise<void> => {
    await api.post('/auth/admin/mfa/disable', { code });
  },

  /**
   * Generate new MFA backup codes (invalidates old ones)
   */
  getBackupCodes: async (): Promise<{ backupCodes: string[] }> => {
    const response = await api.post<{ backupCodes?: string[] }>('/auth/admin/mfa/backup-codes');
    return { backupCodes: (response as { backupCodes?: string[] })?.backupCodes ?? [] };
  },

  // =========================================================================
  // Action MFA Verification
  // =========================================================================

  /**
   * Get MFA status for current user
   */
  getMfaStatus: async (): Promise<{ mfaEnabled: boolean; mfaRequired: boolean }> => {
    const response = await api.get<{ mfaEnabled: boolean; mfaRequired: boolean }>('/auth/admin/mfa/status');
    return response as unknown as { mfaEnabled: boolean; mfaRequired: boolean };
  },

  /**
   * Verify MFA for a sensitive action
   * Returns an action token that can be used to authorize the action
   */
  verifyActionMfa: async (
    code: string,
    action?: string
  ): Promise<{ success: boolean; actionToken: string; expiresIn: number }> => {
    const response = await api.post<{ success: boolean; actionToken: string; expiresIn: number }>(
      '/auth/admin/verify-action-mfa',
      { code, action }
    );
    return response as unknown as { success: boolean; actionToken: string; expiresIn: number };
  },

  // =========================================================================
  // Session Management
  // =========================================================================

  /**
   * Get active sessions
   */
  getSessions: async (): Promise<
    Array<{
      id: string;
      device: string;
      ip: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>
  > => {
    const response = await api.get('/auth/admin/sessions');
    return response as unknown as Array<{
      id: string;
      device: string;
      ip: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>;
  },

  /**
   * Revoke a session
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/admin/sessions/${sessionId}`);
  },

  /**
   * Revoke all other sessions
   */
  revokeAllSessions: async (): Promise<void> => {
    await api.post('/auth/admin/logout-all');
  },
};

export default authService;
