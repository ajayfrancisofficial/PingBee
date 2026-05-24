import { chatApi } from '../../api/RESTApi/chatApi';
import type { ConversationResponse } from '../../types/ApiTypes/RestApiTypes/restApiTypes';

export const chatService = {
  getOrCreateConversation: async (userId: string | number): Promise<ConversationResponse> => {
    return await chatApi.getOrCreateConversation(userId);
  },
};
