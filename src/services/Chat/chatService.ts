import { apiClient } from '../../api/RESTApi/apiClient';
import { ENDPOINTS } from '../../api/RESTApi/endpoints';

export const chatService = {
  getChats: async () => {
    const response = await apiClient.get(ENDPOINTS.CHATS.LIST);
    return response.data;
  },

  getMessages: async (chatId: string) => {
    const response = await apiClient.get(ENDPOINTS.CHATS.MESSAGES(chatId));
    return response.data;
  },

  sendMessage: async (chatId: string, message: string) => {
    // The API expects the message text as a query parameter
    const response = await apiClient.post(
      `${ENDPOINTS.CHATS.SEND_MESSAGE(chatId)}?message=${encodeURIComponent(message)}`
    );
    return response.data;
  },

  markAsRead: async (chatId: string) => {
    const response = await apiClient.post(ENDPOINTS.CHATS.MARK_READ(chatId));
    return response.data;
  },
};
