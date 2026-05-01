import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  UserLoginBody,
  UserRegisterBody,
  RegisterSuccessResponse,
  LoginSuccessResponse,
  GetMeResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const authApi = {
  /**
   * POST /login
   * Sends `identifier` + `password`. Returns raw token response (snake_case keys).
   */
  login: async (request: UserLoginBody): Promise<LoginSuccessResponse> => {
    const { data } = await apiClient.post<LoginSuccessResponse>(
      ENDPOINTS.AUTH.LOGIN,
      request,
    );
    return data;
  },

  /**
   * POST /registers
   * Sends user registration data. Response shape is unknown until backend adds response_model.
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
   * GET /me
   * Returns the current authenticated user's profile.
   */
  getMe: async (): Promise<GetMeResponse> => {
    const { data } = await apiClient.get<GetMeResponse>(ENDPOINTS.AUTH.ME);
    return data;
  },
};
