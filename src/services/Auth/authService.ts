import * as Keychain from 'react-native-keychain';
import { authApi } from '../../api/RESTApi/authApi';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import type {
  UserLoginBody,
  UserRegisterBody,
  LoginSuccessResponse,
  RegisterSuccessResponse,
  ResendOTPBody,
  EmailVerificationBody,
  SendVerificationResponse,
  VerifyEmailResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const authService = {
  login: async (request: UserLoginBody): Promise<LoginSuccessResponse> => {
    try {
      const data = await authApi.login(request);
      const tokenData = data.data;
      if (!tokenData) throw new Error('Auth data missing in response');

      // 1. Store tokens securely
      await Keychain.setGenericPassword('token', tokenData.access_token, {
        service: 'accessToken',
      });
      await Keychain.setGenericPassword('token', tokenData.refresh_token, {
        service: 'refreshToken',
      });

      // 2. Update stores
      useUserStore.getState().setUser({
        userId: tokenData.user_id,
        isVerified: tokenData.is_verified,
      });
      useAuthStore.getState().setLoggedIn(true);

      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (
    request: UserRegisterBody,
  ): Promise<RegisterSuccessResponse> => {
    try {
      const data = await authApi.register(request);
      const tokenData = data.data;
      if (!tokenData) throw new Error('Auth data missing in response');

      // 1. Store tokens securely
      await Keychain.setGenericPassword('token', tokenData.access_token, {
        service: 'accessToken',
      });
      await Keychain.setGenericPassword('token', tokenData.refresh_token, {
        service: 'refreshToken',
      });

      // 2. Update stores
      useUserStore.getState().setUser({
        userId: tokenData.user_id,
        isVerified: tokenData.is_verified,
      });
      useAuthStore.getState().setLoggedIn(true);

      return data;
    } catch (error) {
      throw error;
    }
  },

  sendVerification: async (
    request: ResendOTPBody,
  ): Promise<SendVerificationResponse> => {
    try {
      return await authApi.sendVerification(request);
    } catch (error) {
      throw error;
    }
  },

  verifyEmail: async (
    request: EmailVerificationBody,
  ): Promise<VerifyEmailResponse> => {
    try {
      return await authApi.verifyEmail(request);
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await useAuthStore.getState().logout();
      useUserStore.getState().clearUser();
    } catch (error) {}
  },
};
