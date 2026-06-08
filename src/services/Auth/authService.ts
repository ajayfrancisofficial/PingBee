import * as Keychain from 'react-native-keychain';
import { isAxiosError } from 'axios';
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
import { snackbar } from '../../components/foundations/Snackbar';
import { DBService } from '../DB/DBService';

export const authService = {
  login: async (request: UserLoginBody): Promise<LoginSuccessResponse> => {
    try {
      const data = await authApi.login(request);
      const loginData = data.data;
      if (!loginData) throw new Error('Auth data missing in response');

      // 1. Store tokens securely
      await Keychain.setGenericPassword('token', loginData.access_token, {
        service: 'accessToken',
      });
      await Keychain.setGenericPassword('token', loginData.refresh_token, {
        service: 'refreshToken',
      });

      // 2. Update stores
      useUserStore.getState().setUser({
        userId: loginData.user_id,
        isVerified: loginData.is_verified,
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
      const registerData = data.data;
      if (!registerData) throw new Error('Auth data missing in response');

      // 1. Store tokens securely
      await Keychain.setGenericPassword('token', registerData.access_token, {
        service: 'accessToken',
      });
      await Keychain.setGenericPassword('token', registerData.refresh_token, {
        service: 'refreshToken',
      });

      // 2. Update stores
      useUserStore.getState().setUser({
        userId: registerData.user_id,
        isVerified: registerData.is_verified,
      });
      useAuthStore.getState().setLoggedIn(true);
      snackbar.show({
        message: data?.message || 'Registration Successfull',
        type: 'success',
      });
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

  forgotPassword: async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.forgotPassword({ email });
      if (!response.success)
        throw new Error(response.message || 'Failed to send OTP');
      return response;
    } catch (error) {
      throw error;
    }
  },

  verifyOTP: async (
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string; userId: number }> => {
    try {
      const response = await authApi.verifyForgotPasswordOTP({ email, code });
      if (!response.success)
        throw new Error(response.message || 'Verification failed');

      const data = response.data;
      if (!data) throw new Error('Verification data missing in response');
      return {
        success: response.success,
        message: response.message,
        userId: data.user_id,
      };
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (
    userId: number,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.resetPassword({
        user_id: userId,
        new_password: password,
      });
      if (!response.success)
        throw new Error(response.message || 'Failed to reset password');
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await useAuthStore.getState().logout();
      useUserStore.getState().clearUser();
      // Clear the local WatermelonDB data via DBService
      await DBService.clearDatabase();
    } catch (error) {}
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshCredentials = await Keychain.getGenericPassword({
        service: 'refreshToken',
      });
      if (!refreshCredentials) throw new Error('No refresh token available');

      // Execute refresh
      const refreshData = await authApi.refreshToken({
        refresh_token: refreshCredentials.password,
      });

      // Save new tokens
      const refreshTokenData = refreshData.data;
      if (!refreshTokenData)
        throw new Error('Token data missing in refresh response');

      await Keychain.setGenericPassword(
        'token',
        refreshTokenData.access_token,
        {
          service: 'accessToken',
        },
      );
      await Keychain.setGenericPassword(
        'token',
        refreshTokenData.refresh_token,
        {
          service: 'refreshToken',
        },
      );

      return refreshTokenData.access_token;
    } catch (error) {
      if (isAxiosError(error) && !error.response) {
        console.warn(
          '[authService] Network error during token refresh. Not logging out.',
        );
        throw error;
      }

      // If refresh fails due to server rejecting it (e.g. invalid token), we log out
      snackbar.show({
        message: 'Session expired. Please log in again.',
        type: 'warning',
      });
      await authService.logout();
      throw error;
    }
  },
};
