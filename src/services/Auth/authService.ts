import * as Keychain from 'react-native-keychain';
import { authApi } from '../../api/RESTApi/auth';
import { useAuthStore } from '../../store/authStore';
import { LoginRequest, RegisterRequest } from '../../types/auth';

export const authService = {
  login: async (request: LoginRequest) => {
    try {
      const data = await authApi.login(request);

      // 1. Store tokens securely
      await Keychain.setGenericPassword('token', data.accessToken, {
        service: 'accessToken',
      });
      await Keychain.setGenericPassword('token', data.refreshToken, {
        service: 'refreshToken',
      });

      // 2. Update global auth state
      useAuthStore.getState().setLoggedIn(true);

      return data;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  },

  register: async (request: RegisterRequest) => {
    console.log('🚀 ~ request:', request);
    try {
      const data = await authApi.register(request);
      console.log('🚀 ~ data:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      return await authApi.getProfile();
    } catch (error) {
      console.error('[AuthService] Get profile failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await Keychain.resetGenericPassword({ service: 'accessToken' });
      await Keychain.resetGenericPassword({ service: 'refreshToken' });
      useAuthStore.getState().setLoggedIn(false);
    } catch (error) {
      console.error('[AuthService] Logout failed:', error);
    }
  },
};
