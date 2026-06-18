import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL, ENDPOINTS } from './endpoints';
import { authService } from '../../services/Auth/authService';
import { snackbar } from '../../components/foundations/Snackbar';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token seamlessly
apiClient.interceptors.request.use(
  async config => {
    const credentials = await Keychain.getGenericPassword({
      service: 'accessToken',
    });
    if (credentials) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

export const OFFLINE_SUPPORTED_ENDPOINTS = [
  ENDPOINTS.CHATS.LIST, // '/chats'
  ENDPOINTS.CHATS.MESSAGES, // '/messages'
  ENDPOINTS.CHATS.USER_DETAILS, // '/chat-users-details'
  ENDPOINTS.NOTIFICATIONS.FCM_TOKEN, // '/fcm-token'
];

// Response interceptor: auto-refresh token if 401 triggers & global error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    // Intercept 401 Unauthorized if attempt hasn't been retried
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();

        // Update header and retry previous request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Errors are already handled (snackbar + logout) inside authService.refreshToken
        return Promise.reject(refreshError);
      }
    }

    // --- GLOBAL ERROR HANDLING FOR ALL OTHER CASES ---
    if (status) {
      if (status === 400) {
        // Show exact message from backend
        snackbar.show({
          message: data?.message || 'Invalid Request',
          type: 'warning',
        });
      } else if (status >= 500) {
        snackbar.show({
          message: 'Something went wrong! Please try again later',
          type: 'error',
        });
      } else if (status === 422) {
        //validation errors
        snackbar.show({
          message: data?.message || 'Invalid data. Please try again.',
          type: 'warning',
        });
      } else if (status !== 401) {
        // Fallback for 403, 404, etc. (excluding 401 since it's handled above)
        snackbar.show({
          message: data?.message || 'An unexpected error occurred.',
          type: 'error',
        });
      }
    } else {
      // Network errors (e.g. timeout, no internet connection)
      const requestUrl = error.config?.url || '';
      const isOfflineSupported = OFFLINE_SUPPORTED_ENDPOINTS.some(endpoint =>
        requestUrl.includes(endpoint),
      );

      if (!isOfflineSupported) {
        snackbar.show({
          message: 'Network error. Please check your internet connection.',
          type: 'error',
        });
      }
    }

    // Always reject the promise so the calling component's catch block is still triggered!
    return Promise.reject(error);
  },
);
