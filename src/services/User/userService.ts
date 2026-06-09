import { userApi } from '../../api/RESTApi/userApi';
import { useUserStore } from '../../store/userStore';
import { MediaUtils } from '../../utils/media';
import type {
  GetMeResponse,
  GetAllUsersResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const userService = {
  getProfile: async (): Promise<GetMeResponse> => {
    try {
      const response = await userApi.getMe();
      if (response.data) {
        const store = useUserStore.getState();

        // First set the standard textual user details
        store.setUser({
          userId: response.data.user_id,
          username: response.data.username,
          email: response.data.email,
          isVerified: response.data.is_verified,
          name: response.data.full_name,
        });

        // Delegate profile image download & compression cache to the store's action
        const avatarUrl = response.data.avatar_url || '';
        await store.updateProfilePicture(avatarUrl);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Uploads a (pre-compressed) profile picture to the backend.
   * On success, updates the Zustand store and triggers caching/compression of the remote URL.
   * The caller is responsible for compressing the image before calling this.
   *
   * @param localUri - The local file URI of the (compressed) image to upload.
   */
  uploadProfilePicture: async (
    localUri: string,
  ): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData();
    const filename = localUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: localUri,
      name: filename,
      type,
    } as any);

    // Capture old local paths to clean up later on successful upload and cache write
    const oldProfilePicture = useUserStore.getState().profilePicture;
    const oldAvatar = useUserStore.getState().avatar;

    try {
      const response = await userApi.uploadAvatar(formData);
      if (response.success && response.data) {
        const avatarUrl = (response.data.avatar_url as string) || '';

        // Update the Zustand store and trigger caching/compression of the remote URL
        await useUserStore.getState().updateProfilePicture(avatarUrl);

        // Delete old local media files only after successful update/cache write
        if (oldProfilePicture && oldProfilePicture.startsWith('file://')) {
          await MediaUtils.deleteMedia(oldProfilePicture);
        }
        if (oldAvatar && oldAvatar.startsWith('file://')) {
          await MediaUtils.deleteMedia(oldAvatar);
        }

        return { success: true, url: avatarUrl };
      }
      throw new Error(response.message || 'Failed to upload profile picture');
    } catch (error) {
      console.error('[userService] Failed to upload profile picture:', error);
      throw error;
    }
  },

  /**
   * Deletes the profile picture from the backend.
   * On success, clears the Zustand store and deletes local cached media.
   */
  deleteProfilePicture: async (): Promise<{ success: boolean }> => {
    const oldProfilePicture = useUserStore.getState().profilePicture;
    const oldAvatar = useUserStore.getState().avatar;

    try {
      const response = await userApi.deleteAvatar();
      if (response.success) {
        useUserStore.getState().deleteProfilePicture();

        if (oldProfilePicture && oldProfilePicture.startsWith('file://')) {
          await MediaUtils.deleteMedia(oldProfilePicture);
        }
        if (oldAvatar && oldAvatar.startsWith('file://')) {
          await MediaUtils.deleteMedia(oldAvatar);
        }

        return { success: true };
      }
      throw new Error(response.message || 'Failed to delete profile picture');
    } catch (error) {
      console.error('[userService] Failed to delete profile picture:', error);
      throw error;
    }
  },

  getAllUsers: async (): Promise<GetAllUsersResponse> => {
    return await userApi.getAllUsers();
  },
};
