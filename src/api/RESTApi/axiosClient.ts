import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL } from './endpoints';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'accessToken' });
      if (credentials) {
        config.headers.Authorization = `Bearer ${credentials.password}`;
      }
    } catch (error) {
      console.warn('Failed to retrieve auth token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized) - e.g., trigger logout
    if (error.response?.status === 401) {
      // In a real app, you might want to redirect to login or refresh token
      console.warn('Unauthorized request, check auth state.');
    }
    return Promise.reject(error);
  }
);
