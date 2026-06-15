import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  GetMeResponse,
  GetAllUsersResponse,
  SearchUsersResponse,
  UserSearchBody,
  UploadAvatarResponse,
  DeleteAvatarResponse,
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

  /**
   * POST /users-avatar
   */
  uploadAvatar: async (formData: FormData): Promise<UploadAvatarResponse> => {
    const { data } = await apiClient.post<UploadAvatarResponse>(
      ENDPOINTS.USERS.AVATAR_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data;
  },

  /**
   * DELETE /users-avatar
   */
  deleteAvatar: async (): Promise<DeleteAvatarResponse> => {
    const { data } = await apiClient.delete<DeleteAvatarResponse>(
      ENDPOINTS.USERS.AVATAR_DELETE,
    );
    return data;
  },
};
