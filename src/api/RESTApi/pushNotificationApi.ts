import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  SaveFcmTokenBody,
  SaveFcmTokenResponse,
  DeleteFcmTokenBody,
  DeleteFcmTokenResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const pushNotificationApi = {
  /**
   * POST /fcm-token
   * Saves/updates the device FCM token on the server.
   */
  saveFcmToken: async (
    request: SaveFcmTokenBody,
  ): Promise<SaveFcmTokenResponse> => {
    const { data } = await apiClient.post<SaveFcmTokenResponse>(
      ENDPOINTS.NOTIFICATIONS.FCM_TOKEN,
      request,
    );
    return data;
  },

  /**
   * DELETE /fcm-token
   * Removes the device FCM token from the server (called on logout).
   */
  deleteFcmToken: async (
    request: DeleteFcmTokenBody,
    headers?: Record<string, string>,
  ): Promise<DeleteFcmTokenResponse> => {
    const { data } = await apiClient.delete<DeleteFcmTokenResponse>(
      ENDPOINTS.NOTIFICATIONS.FCM_TOKEN,
      { data: request, headers },
    );
    return data;
  },
};
