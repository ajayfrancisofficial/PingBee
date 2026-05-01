import { axiosInstance } from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../types/auth';

export const authApi = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      request,
    );
    return data;
  },

  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    console.log('🚀 ~ request:', request);
    console.log('🚀 ~ ENDPOINTS.AUTH.REGISTER:', ENDPOINTS.AUTH.REGISTER);
    const { data } = await axiosInstance.post<RegisterResponse>(
      ENDPOINTS.AUTH.REGISTER,
      request,
    );
    return data;
  },

  getProfile: async (): Promise<any> => {
    const { data } = await axiosInstance.get(ENDPOINTS.AUTH.ME);
    return data;
  },
};
