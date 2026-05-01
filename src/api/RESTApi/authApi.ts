import { axiosInstance } from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import type {
  UserLoginBody,
  UserRegisterBody,
  RegisterSuccessResponse,
  LoginSuccessResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const authApi = {
  /**
   * POST /login
   * Sends `identifier` + `password`. Returns raw token response (snake_case keys).
   */
  login: async (request: UserLoginBody): Promise<LoginSuccessResponse> => {
    const { data } = await axiosInstance.post<LoginSuccessResponse>(
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
    const { data } = await axiosInstance.post<RegisterSuccessResponse>(
      ENDPOINTS.AUTH.REGISTER,
      request,
    );
    return data;
  },
};
