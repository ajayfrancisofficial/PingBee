import { axiosInstance } from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import * as Keychain from 'react-native-keychain';

export const authApi = {
  login: async (email: string, password: string) => {
    // This is a future-proof dummy implementation. 
    // Usually: const { data } = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    
    // Simulating network delay
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    
    // Simulating token response
    const data = { accessToken: 'dummy_access_123', refreshToken: 'dummy_refresh_123' };
    
    // Store securely via OS-level encryption (Keychain/Keystore)
    await Keychain.setGenericPassword('token', data.accessToken, { service: 'accessToken' });
    await Keychain.setGenericPassword('token', data.refreshToken, { service: 'refreshToken' });
    
    return data;
  },

  register: async (email: string, password: string) => {
    // Usually: await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, { email, password });
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    return true;
  },
};

