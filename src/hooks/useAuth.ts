/**
 * Auth Hooks
 * React Query hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { authService } from '../services/authService';
import { queryKeys } from '../lib/queryClient';
import {
  useAppDispatch,
  useAppSelector,
  setCredentials,
  setMfaRequired,
  clearMfa,
  logout as logoutAction,
  setInitialized,
  setAuthLoading,
  setAuthError,
  selectIsAuthenticated,
  selectUser,
  selectRequiresMfa,
  selectMfaToken,
  selectIsInitialized,
  selectAuthLoading,
  selectAuthError,
  selectHasPermission,
  selectHasAnyPermission,
  selectHasAllPermissions,
} from '../store';
import type { LoginCredentials, MfaVerifyRequest, Permission } from '../types/auth';

// =============================================================================
// Auth State Hooks
// =============================================================================

/**
 * Hook to access auth state
 */
export const useAuthState = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const user = useAppSelector(selectUser);
  const requiresMfa = useAppSelector(selectRequiresMfa);
  const mfaToken = useAppSelector(selectMfaToken);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  return {
    isAuthenticated,
    isInitialized,
    user,
    requiresMfa,
    mfaToken,
    isLoading,
    error,
  };
};

/**
 * Hook to check permissions
 */
export const usePermissions = () => {
  return {
    hasPermission: (permission: Permission) =>
      useAppSelector(selectHasPermission(permission)),
    hasAnyPermission: (permissions: Permission[]) =>
      useAppSelector(selectHasAnyPermission(permissions)),
    hasAllPermissions: (permissions: Permission[]) =>
      useAppSelector(selectHasAllPermissions(permissions)),
  };
};

/**
 * Hook to check a single permission
 */
export const useHasPermission = (permission: Permission): boolean => {
  return useAppSelector(selectHasPermission(permission));
};

// =============================================================================
// Auth Actions
// =============================================================================

/**
 * Main auth hook with login, logout, and MFA operations
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onMutate: () => {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));
    },
    onSuccess: (data) => {
      if (data.requiresMfa && data.mfaToken) {
        // MFA required - store temp token
        dispatch(setMfaRequired({ mfaToken: data.mfaToken }));
      } else if (data.user && data.token) {
        // Login complete
        dispatch(setCredentials({ user: data.user, token: data.token }));
        setLocation('/dashboard');
      }
    },
    onError: (error: Error) => {
      dispatch(setAuthError(error.message || 'Login failed'));
    },
  });

  // MFA verification mutation
  const verifyMfaMutation = useMutation({
    mutationFn: (data: MfaVerifyRequest) => authService.verifyMfa(data),
    onMutate: () => {
      dispatch(setAuthLoading(true));
    },
    onSuccess: (data) => {
      if (data.user && data.token) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
        setLocation('/dashboard');
      }
    },
    onError: (error: Error) => {
      dispatch(setAuthError(error.message || 'MFA verification failed'));
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
      setLocation('/login');
    },
    onError: () => {
      // Force logout on client even if server fails
      dispatch(logoutAction());
      queryClient.clear();
      setLocation('/login');
    },
  });

  // Cancel MFA
  const cancelMfa = () => {
    dispatch(clearMfa());
  };

  return {
    // Actions
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    verifyMfa: verifyMfaMutation.mutate,
    verifyMfaAsync: verifyMfaMutation.mutateAsync,
    logout: logoutMutation.mutate,
    cancelMfa,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isVerifyingMfa: verifyMfaMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    mfaError: verifyMfaMutation.error,
  };
};

// =============================================================================
// Auth Initialization
// =============================================================================

/**
 * Hook to initialize auth state on app startup
 */
export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);

  const { isLoading } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const user = await authService.getMe();
        const token = localStorage.getItem('auth_token');
        if (user && token) {
          dispatch(setCredentials({ user, token }));
        }
        return user;
      } catch {
        // Not authenticated - that's ok
        dispatch(logoutAction());
        return null;
      } finally {
        dispatch(setInitialized(true));
      }
    },
    enabled: !isInitialized,
    retry: false,
    staleTime: Infinity,
  });

  return { isLoading: isLoading && !isInitialized, isInitialized };
};

// =============================================================================
// Profile & Password
// =============================================================================

/**
 * Hook for changing password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
  });
};

/**
 * Hook for password reset request
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });
};

/**
 * Hook for resetting password with token
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
  });
};

// =============================================================================
// MFA Management
// =============================================================================

/**
 * Hook for MFA setup
 */
export const useMfaSetup = () => {
  return useMutation({
    mutationFn: authService.setupMfa,
  });
};

/**
 * Hook for enabling MFA
 */
export const useEnableMfa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authService.enableMfa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

/**
 * Hook for disabling MFA
 */
export const useDisableMfa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authService.disableMfa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

// =============================================================================
// Session Management
// =============================================================================

/**
 * Hook to get active sessions
 */
export const useSessions = () => {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: authService.getSessions,
  });
};

/**
 * Hook to revoke a session
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions });
    },
  });
};

/**
 * Hook to revoke all other sessions
 */
export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions });
    },
  });
};

export default useAuth;
