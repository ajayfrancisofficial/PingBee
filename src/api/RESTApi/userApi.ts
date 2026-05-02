import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  GetMeResponse,
  GetAllUsersResponse,
  SearchUsersResponse,
  UserSearchBody,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const userApi = {
  /**
   * GET /me
   * Returns the current authenticated user's profile.
   */
  getMe: async (): Promise<GetMeResponse> => {
    const { data } = await apiClient.get<GetMeResponse>(ENDPOINTS.USERS.ME);
    return data;
  },

  /**
   * POST /users
   */
  getAllUsers: async (): Promise<GetAllUsersResponse> => {
    const { data } = await apiClient.post<GetAllUsersResponse>(
      ENDPOINTS.USERS.LIST,
    );
    return data;
  },

  /**
   * POST /user-search
   */
  searchUsers: async (query: string): Promise<SearchUsersResponse> => {
    const body: UserSearchBody = {
      query,
    };
    const { data } = await apiClient.post<SearchUsersResponse>(
      ENDPOINTS.USERS.SEARCH,
      body,
    );
    return data;
  },
};
