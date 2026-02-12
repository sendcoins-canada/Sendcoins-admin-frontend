import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// =============================================================================
// Types
// =============================================================================

interface ModalState {
  isOpen: boolean;
  data?: Record<string, unknown>;
}

interface UiState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;

  // Global loading overlay
  globalLoading: boolean;
  globalLoadingMessage: string | null;

  // Modals
  modals: {
    confirmAction: ModalState & {
      data?: {
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        variant?: 'danger' | 'warning' | 'info';
        onConfirm?: () => void;
      };
    };
    userDetails: ModalState & { data?: { userId: string } };
    transactionDetails: ModalState & { data?: { transactionId: string } };
    teamMemberDetails: ModalState & { data?: { memberId: string } };
    createTeamMember: ModalState;
    editRole: ModalState & { data?: { roleId: number } };
    createRole: ModalState;
  };

  // Toast notifications (simple implementation)
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;

  // Theme
  theme: 'light' | 'dark' | 'system';
}

// =============================================================================
// Initial State
// =============================================================================

const getInitialTheme = (): 'light' | 'dark' | 'system' => {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

const getInitialSidebarState = (): boolean => {
  const stored = localStorage.getItem('sidebar_collapsed');
  return stored === 'true';
};

const initialModalState: ModalState = {
  isOpen: false,
  data: undefined,
};

const initialState: UiState = {
  sidebarCollapsed: getInitialSidebarState(),
  sidebarMobileOpen: false,

  globalLoading: false,
  globalLoadingMessage: null,

  modals: {
    confirmAction: initialModalState,
    userDetails: initialModalState,
    transactionDetails: initialModalState,
    teamMemberDetails: initialModalState,
    createTeamMember: initialModalState,
    editRole: initialModalState,
    createRole: initialModalState,
  },

  toasts: [],

  theme: getInitialTheme(),
};

// =============================================================================
// Slice
// =============================================================================

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', String(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebar_collapsed', String(action.payload));
    },
    toggleMobileSidebar: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    closeMobileSidebar: (state) => {
      state.sidebarMobileOpen = false;
    },

    // Global loading
    setGlobalLoading: (
      state,
      action: PayloadAction<{ loading: boolean; message?: string }>
    ) => {
      state.globalLoading = action.payload.loading;
      state.globalLoadingMessage = action.payload.message ?? null;
    },

    // Generic modal opener
    openModal: <K extends keyof UiState['modals']>(
      state: UiState,
      action: PayloadAction<{
        modal: K;
        data?: UiState['modals'][K]['data'];
      }>
    ) => {
      const { modal, data } = action.payload;
      state.modals[modal] = {
        isOpen: true,
        data: data as UiState['modals'][typeof modal]['data'],
      };
    },

    // Generic modal closer
    closeModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = {
        isOpen: false,
        data: undefined,
      };
    },

    // Close all modals
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof typeof state.modals] = {
          isOpen: false,
          data: undefined,
        };
      });
    },

    // Toast notifications
    addToast: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message?: string;
        duration?: number;
      }>
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.toasts.push({
        id,
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
  },
});

// =============================================================================
// Actions
// =============================================================================

export const {
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
} = uiSlice.actions;

// =============================================================================
// Selectors
// =============================================================================

// Sidebar
export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed;
export const selectSidebarMobileOpen = (state: RootState) => state.ui.sidebarMobileOpen;

// Global loading
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading;
export const selectGlobalLoadingMessage = (state: RootState) => state.ui.globalLoadingMessage;

// Modals
export const selectModals = (state: RootState) => state.ui.modals;
export const selectModal = <K extends keyof UiState['modals']>(modal: K) => (state: RootState) =>
  state.ui.modals[modal];

// Toasts
export const selectToasts = (state: RootState) => state.ui.toasts;

// Theme
export const selectTheme = (state: RootState) => state.ui.theme;

export default uiSlice.reducer;
