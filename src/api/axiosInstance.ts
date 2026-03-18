import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL, ENDPOINTS } from './endpoints';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token seamlessly
axiosInstance.interceptors.request.use(async (config) => {
  const credentials = await Keychain.getGenericPassword({ service: 'accessToken' });
  if (credentials) {
    config.headers.Authorization = `Bearer ${credentials.password}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: auto-refresh token if 401 triggers
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Intercept 401 Unauthorized if attempt hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshCredentials = await Keychain.getGenericPassword({ service: 'refreshToken' });
        if (!refreshCredentials) throw new Error('No refresh token available');

        // Execute refresh
        const { data } = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refreshToken: refreshCredentials.password,
        });

        // Save new tokens
        await Keychain.setGenericPassword('token', data.accessToken, { service: 'accessToken' });
        await Keychain.setGenericPassword('token', data.refreshToken, { service: 'refreshToken' });

        // Update header and retry previous request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If the refresh token also fails, explicitly flush secure tokens and logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
