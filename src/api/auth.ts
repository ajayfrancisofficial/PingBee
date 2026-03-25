import { axiosInstance } from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import * as Keychain from 'react-native-keychain';

import { LoginRequest, LoginResponse } from '../types/auth';

export const authApi = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    // Simulating network delay
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    // Simulating token response based on login type
    const data: LoginResponse = {
      accessToken: 'dummy_access_123',
      refreshToken: 'dummy_refresh_123',
      user: {
        id: 'user_123',
        ...(request.type === 'phoneLogin' && { phoneNumber: request.phoneNumber }),
        ...(request.type === 'emailLogin' && { email: request.email }),
      },
    };

    // Store securely
    await Keychain.setGenericPassword('token', data.accessToken, { service: 'accessToken' });
    await Keychain.setGenericPassword('token', data.refreshToken, { service: 'refreshToken' });

    console.log(`Successfully logged in via ${request.type}`);
    return data;
  },

  register: async (email: string, password: string) => {
    // Usually: await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, { email, password });
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    return true;
  },
};

