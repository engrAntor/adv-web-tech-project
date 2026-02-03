import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL, // Use the hardcoded URL
  // Don't set default Content-Type here - let axios handle it
  // For JSON requests, axios will set it automatically
  // For FormData, it needs to set multipart/form-data with boundary
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      // Debug: log token status for protected endpoints
      if (config.url?.includes('/users/') || config.url?.includes('/auth/me')) {
        console.log('[Axios] Request to:', config.url, '| Token exists:', !!token);
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 errors with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const requestUrl = originalRequest?.url || '';

      // Don't attempt refresh for:
      // 1. Login/register pages (wrong credentials is expected)
      // 2. Auth endpoints (login, register, refresh-token, etc.)
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      const isAuthEndpoint = requestUrl.includes('/auth/');

      if (isAuthPage || isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Check if we have a refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token, clear everything and redirect
        console.log('[Axios] 401 Unauthorized - no refresh token, redirecting to login');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Prevent infinite loops - don't retry if we already tried
      if (originalRequest._retry) {
        console.log('[Axios] 401 Unauthorized - refresh already attempted, redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[Axios] 401 Unauthorized - attempting token refresh');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', newRefreshToken);

        console.log('[Axios] Token refresh successful');

        // Update the Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process queued requests
        processQueue(null, access_token);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('[Axios] Token refresh failed, redirecting to login');
        processQueue(refreshError as Error, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
