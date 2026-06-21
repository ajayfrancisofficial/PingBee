import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { PingyDetailsResponse } from '../../types/ApiTypes/RestApiTypes/restApiTypes';

/**
 * API module for Pingy AI Chatbot operations.
 */
export const pingyApi = {
  /**
   * Fetch Pingy chatbot details (name, chatId, avatarUrl, etc.).
   * Called at app boot alongside /chats.
   */
  fetchPingyDetails: async (): Promise<PingyDetailsResponse> => {
    const { data } = await apiClient.get<PingyDetailsResponse>(
      ENDPOINTS.PINGY.DETAILS,
    );
    return data;
  },
};
