import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { User as AdminUser, Permission } from '../../types/auth';

// =============================================================================
// Types
// =============================================================================

interface AuthState {
  // Core auth state
  isAuthenticated: boolean;
  isInitialized: boolean; // Has the app checked auth status on startup?
  user: AdminUser | null;
  token: string | null;

  // MFA state
  requiresMfa: boolean;
  mfaToken: string | null; // Temporary token for MFA verification

  // UI state
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  token: localStorage.getItem('auth_token'),

  requiresMfa: false,
  mfaToken: null,

  isLoading: false,
  error: null,
};

// =============================================================================
// Slice
// =============================================================================

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set initialized (after checking auth on app startup)
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },

    // Set credentials after successful login
    setCredentials: (
      state,
      action: PayloadAction<{ user: AdminUser; token: string; refreshToken?: string }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.requiresMfa = false;
      state.mfaToken = null;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    },

    // Update user data (e.g., after profile update)
    updateUser: (state, action: PayloadAction<Partial<AdminUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Set MFA required state (after password auth, before MFA verification)
    setMfaRequired: (state, action: PayloadAction<{ mfaToken: string }>) => {
      state.requiresMfa = true;
      state.mfaToken = action.payload.mfaToken;
      state.isLoading = false;
    },

    // Clear MFA state (on cancel or back)
    clearMfa: (state) => {
      state.requiresMfa = false;
      state.mfaToken = null;
    },

    // Logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.requiresMfa = false;
      state.mfaToken = null;
      state.error = null;
      state.isLoading = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    },

    // Update token (after refresh)
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('auth_token', action.payload);
    },
  },
});

// =============================================================================
// Actions
// =============================================================================

export const {
  setLoading,
  setError,
  clearError,
  setInitialized,
  setCredentials,
  updateUser,
  setMfaRequired,
  clearMfa,
  logout,
  updateToken,
} = authSlice.actions;

// =============================================================================
// Selectors
// =============================================================================

// Basic selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// MFA selectors
export const selectRequiresMfa = (state: RootState) => state.auth.requiresMfa;
export const selectMfaToken = (state: RootState) => state.auth.mfaToken;

// Permission selectors
export const selectPermissions = (state: RootState): Permission[] =>
  state.auth.user?.permissions ?? [];

export const selectHasPermission = (permission: Permission) => (state: RootState): boolean =>
  state.auth.user?.permissions?.includes(permission) ?? false;

export const selectHasAnyPermission = (permissions: Permission[]) => (state: RootState): boolean =>
  permissions.some((p) => state.auth.user?.permissions?.includes(p) ?? false);

export const selectHasAllPermissions = (permissions: Permission[]) => (state: RootState): boolean =>
  permissions.every((p) => state.auth.user?.permissions?.includes(p) ?? false);

// Role selector
export const selectUserRole = (state: RootState) => state.auth.user?.role;

export default authSlice.reducer;
