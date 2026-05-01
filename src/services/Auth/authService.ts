import * as Keychain from 'react-native-keychain';
import { axiosClient } from '../../api/RESTApi/axiosClient';
import { ENDPOINTS } from '../../api/RESTApi/endpoints';
import { useAuthStore } from '../../store/authStore';

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, { username, password });
      const { access_token } = response.data;

      // Store the token securely
      await Keychain.setGenericPassword('token', access_token, { service: 'accessToken' });
      
      // Update store
      useAuthStore.getState().setLoggedIn(true);
      
      return response.data;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  register: async (data: any) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await axiosClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
