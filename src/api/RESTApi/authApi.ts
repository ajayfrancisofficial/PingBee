import axios from 'axios';
import { apiClient } from './apiClient';
import { API_BASE_URL, ENDPOINTS } from './endpoints';
import type {
  UserLoginBody,
  UserRegisterBody,
  RegisterSuccessResponse,
  LoginSuccessResponse,
  ResendOTPBody,
  EmailVerificationBody,
  SendVerificationResponse,
  VerifyEmailResponse,
  RefreshTokenBody,
  RefreshSuccessResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const authApi = {
  /**
   * POST /login
   * Sends `identifier` + `password`.
   */
  login: async (request: UserLoginBody): Promise<LoginSuccessResponse> => {
    const { data } = await apiClient.post<LoginSuccessResponse>(
      ENDPOINTS.AUTH.LOGIN,
      request,
    );
    return data;
  },

  /**
   * POST /register
   * Sends user registration data.
   */
  register: async (
    request: UserRegisterBody,
  ): Promise<RegisterSuccessResponse> => {
    const { data } = await apiClient.post<RegisterSuccessResponse>(
      ENDPOINTS.AUTH.REGISTER,
      request,
    );
    return data;
  },

  /**
   * POST /send-verification
   */
  sendVerification: async (
    request: ResendOTPBody,
  ): Promise<SendVerificationResponse> => {
    const { data } = await apiClient.post<SendVerificationResponse>(
      ENDPOINTS.AUTH.SEND_VERIFICATION,
      request,
    );
    return data;
  },

  /**
   * POST /verify-email
   */
  verifyEmail: async (
    request: EmailVerificationBody,
  ): Promise<VerifyEmailResponse> => {
    const { data } = await apiClient.post<VerifyEmailResponse>(
      ENDPOINTS.AUTH.VERIFY_EMAIL,
      request,
    );
    return data;
  },

  /**
   * POST /refresh
   * Refreshes the access token using a refresh token.
   * Note: Uses axios directly to avoid apiClient interceptors (prevent infinite loop).
   */
  refreshToken: async (
    request: RefreshTokenBody,
  ): Promise<RefreshSuccessResponse> => {
    const { data } = await axios.post<RefreshSuccessResponse>(
      `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      request,
    );
    return data;
  },
};
