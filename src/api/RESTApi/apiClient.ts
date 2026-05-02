import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL, ENDPOINTS } from './endpoints';
import { useAuthStore } from '../../store/authStore';
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
        const refreshCredentials = await Keychain.getGenericPassword({
          service: 'refreshToken',
        });
        if (!refreshCredentials) throw new Error('No refresh token available');

        // Execute refresh (backend expects { refresh_token: string })
        const { data: refreshData } = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {
            refresh_token: refreshCredentials.password,
          },
        );

        // Save new tokens (backend returns snake_case inside data wrapper)
        const tokenData = refreshData.data;
        if (!tokenData)
          throw new Error('Token data missing in refresh response');

        await Keychain.setGenericPassword('token', tokenData.access_token, {
          service: 'accessToken',
        });
        await Keychain.setGenericPassword('token', tokenData.refresh_token, {
          service: 'refreshToken',
        });

        // Update header and retry previous request
        originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If the refresh token also fails, explicitly flush secure tokens and logout
        snackbar.show({
          message: 'Session expired. Please log in again.',
          type: 'warning',
        });
        useAuthStore.getState().logout();
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
      } else if (status === 422 || status >= 500) {
        snackbar.show({
          message: 'Something went wrong! Please try again later',
          type: 'error',
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
      snackbar.show({
        message: 'Network error. Please check your internet connection.',
        type: 'error',
      });
    }

    // Always reject the promise so the calling component's catch block is still triggered!
    return Promise.reject(error);
  },
);
