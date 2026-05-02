import { userApi } from '../../api/RESTApi/userApi';
import { useUserStore } from '../../store/userStore';
import type {
  GetMeResponse,
  GetAllUsersResponse,
  ConversationResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export type UpdateProfilePictureType = 'removed' | 'gallery' | 'camera';

export const userService = {
  getProfile: async (): Promise<GetMeResponse> => {
    try {
      const response = await userApi.getMe();
      if (response.data) {
        useUserStore.getState().setUser({
          userId: response.data.user_id,
          username: response.data.username,
          email: response.data.email,
          isVerified: response.data.is_verified,
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mock API service for updating the user profile picture.
   * Shows how a multipart/form-data request would be structured.
   */
  updateProfilePicture: async (
    localUri: string, 
    updateType: UpdateProfilePictureType
  ): Promise<{ success: boolean; url: string }> => {
    console.log(`[userService] Updating profile picture. Type: ${updateType}, URI: ${localUri}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(() => resolve(undefined), 800));

    // Mock response
    if (updateType === 'removed') {
      return { success: true, url: '' };
    } else {
      // Returning the local URI conceptually representing the remote CDN URL success
      return { success: true, url: localUri };
    }
  },

  getAllUsers: async (): Promise<GetAllUsersResponse> => {
    return await userApi.getAllUsers();
  },

  getOrCreateConversation: async (userId: string): Promise<ConversationResponse> => {
    return await userApi.getOrCreateConversation(userId);
  },
};
