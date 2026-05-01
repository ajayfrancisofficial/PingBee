import * as Keychain from 'react-native-keychain';
import { authApi } from '../../api/RESTApi/authApi';
import { useAuthStore } from '../../store/authStore';
import type {
  UserLoginBody,
  UserRegisterBody,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const authService = {
  login: async (request: UserLoginBody) => {
    try {
      const data = await authApi.login(request);
      // 1. Store tokens securely (backend returns snake_case inside data wrapper)
      const tokenData = data.data;
      if (!tokenData) throw new Error('Auth data missing in response');

      await Keychain.setGenericPassword('token', tokenData.access_token, {
        service: 'accessToken',
      });
      await Keychain.setGenericPassword('token', tokenData.refresh_token, {
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

  register: async (request: UserRegisterBody) => {
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
      return await authApi.getMe();
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
