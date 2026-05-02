import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  GetMeResponse,
  GetAllUsersResponse,
  ConversationResponse,
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
    const { data } = await apiClient.post<GetAllUsersResponse>(ENDPOINTS.USERS.LIST);
    return data;
  },

  /**
   * POST /conversation/{user_id}
   */
  getOrCreateConversation: async (userId: string): Promise<ConversationResponse> => {
    const { data } = await apiClient.post<ConversationResponse>(
      ENDPOINTS.USERS.GET_CONVERSATION(userId)
    );
    return data;
  },
};
