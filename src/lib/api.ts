import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { store } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://sendcoins-admin.vercel.app';
const TIMEOUT = 30000; // 30 seconds

// =============================================================================
// Create Axios Instance
// =============================================================================

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// Request Interceptor
// =============================================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Redux store
    const state = store.getState();
    const token = state.auth.token;

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// =============================================================================
// Response Interceptor with Token Refresh
// =============================================================================

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // Success: unwrap response data
  (response: AxiosResponse) => {
    return response.data;
  },

  // Error handling
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip refresh for auth routes that don't require authentication
    const skipRefreshRoutes = ['/auth/admin/login', '/auth/admin/refresh', '/auth/admin/forgot-password', '/auth/admin/set-password'];
    const shouldSkipRefresh = skipRefreshRoutes.some(route => originalRequest.url?.includes(route));

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/admin/refresh`,
          { refreshToken }
        );

        const newToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        // Store new refresh token (token rotation)
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Update token in store
        const state = store.getState();
        if (state.auth.user) {
          store.dispatch(
            setCredentials({
              user: state.auth.user,
              token: newToken,
            })
          );
        }

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(new Error('Token refresh failed'));
        store.dispatch(logout());
        // Only redirect if not already on login page to prevent infinite loop
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const message = getErrorMessage(error);
    return Promise.reject(new Error(message));
  }
);

// =============================================================================
// Error Message Helper
// =============================================================================

function getErrorMessage(error: AxiosError): string {
  // Server responded with error
  if (error.response?.data) {
    const data = error.response.data as {
      message?: string;
      error?: string;
      errors?: string[];
    };

    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.errors?.length) return data.errors[0];
  }

  // Network error
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }

  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  // HTTP status based messages
  const statusMessages: Record<number, string> = {
    400: 'Bad request. Please check your input.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. Please refresh and try again.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please wait and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable.',
    503: 'Service temporarily unavailable.',
  };

  return statusMessages[error.response.status] || 'An unexpected error occurred.';
}

// =============================================================================
// Typed API Methods
// =============================================================================

export const apiClient = {
  get: <T>(url: string, config?: object): Promise<T> => api.get(url, config),

  post: <T>(url: string, data?: object, config?: object): Promise<T> =>
    api.post(url, data, config),

  put: <T>(url: string, data?: object, config?: object): Promise<T> =>
    api.put(url, data, config),

  patch: <T>(url: string, data?: object, config?: object): Promise<T> =>
    api.patch(url, data, config),

  delete: <T>(url: string, config?: object): Promise<T> => api.delete(url, config),
};

// =============================================================================
// Helper for delay (useful for testing loading states)
// =============================================================================

export const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// Export
// =============================================================================

export default api;
