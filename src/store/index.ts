import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Slices
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// =============================================================================
// Store Configuration
// =============================================================================

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (for callbacks in modals)
        ignoredActions: ['ui/openModal'],
        // Ignore these paths in the state
        ignoredPaths: ['ui.modals.confirmAction.data.onConfirm'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// =============================================================================
// Types
// =============================================================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// =============================================================================
// Typed Hooks
// =============================================================================

/**
 * Typed version of useDispatch hook
 * Use this instead of plain `useDispatch`
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Use this instead of plain `useSelector`
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// =============================================================================
// Re-exports
// =============================================================================

// Auth
export {
  setLoading as setAuthLoading,
  setError as setAuthError,
  clearError,
  setInitialized,
  setCredentials,
  updateUser,
  setMfaRequired,
  clearMfa,
  logout,
  updateToken,
  selectAuth,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsInitialized,
  selectAuthLoading,
  selectAuthError,
  selectRequiresMfa,
  selectMfaToken,
  selectPermissions,
  selectHasPermission,
  selectHasAnyPermission,
  selectHasAllPermissions,
  selectUserRole,
} from './slices/authSlice';

// UI
export {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearAllToasts,
  setTheme,
  selectSidebarCollapsed,
  selectSidebarMobileOpen,
  selectGlobalLoading,
  selectGlobalLoadingMessage,
  selectModals,
  selectModal,
  selectToasts,
  selectTheme,
} from './slices/uiSlice';
