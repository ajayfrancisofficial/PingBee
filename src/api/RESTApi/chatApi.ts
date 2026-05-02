import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  GetChatsResponse,
  GetMessagesResponse,
  ConversationResponse,
  MessageFetchBody,
  MarkAsReadBody,
  ConversationCreateBody,
  MarkAsReadResponse,
} from '../../types/ApiTypes/RestApiTypes/restApiTypes';

/** How many messages to fetch per page */
export const MESSAGES_PAGE_SIZE = 30;

// ─── Chats ───────────────────────────────────────────────────────────────────

export const chatApi = {
  /**
   * Fetch all chats for the authenticated user.
   */
  fetchChats: async (): Promise<GetChatsResponse> => {
    const { data } = await apiClient.get<GetChatsResponse>(ENDPOINTS.CHATS.LIST);
    return data;
  },

  /**
   * POST /conversation
   * Creates or retrieves a conversation with a specific user.
   */
  getOrCreateConversation: async (
    userId: number | string,
  ): Promise<ConversationResponse> => {
    const body: ConversationCreateBody = {
      user_id: Number(userId),
    };
    const { data } = await apiClient.post<ConversationResponse>(
      ENDPOINTS.CHATS.GET_CONVERSATION,
      body,
    );
    return data;
  },

  /**
   * POST /messages
   * Fetch a page of messages for a conversation.
   * @param chatId - The conversation ID.
   * @param cursor - Pagination cursor for older messages.
   */
  fetchMessages: async (
    chatId: string,
    skip: number = 0,
  ): Promise<GetMessagesResponse> => {
    const body: MessageFetchBody = {
      conversation_id: Number(chatId),
      skip: skip,
      limit: MESSAGES_PAGE_SIZE,
    };

    const { data } = await apiClient.post<GetMessagesResponse>(
      ENDPOINTS.CHATS.MESSAGES,
      body,
    );
    return data;
  },

  /**
   * POST /mark-as-read
   * Marks all messages in a conversation as read.
   */
  markAsRead: async (chatId: string): Promise<MarkAsReadResponse> => {
    const body: MarkAsReadBody = {
      conversation_id: Number(chatId),
    };
    const { data } = await apiClient.post<MarkAsReadResponse>(
      ENDPOINTS.CHATS.MARK_READ,
      body,
    );
    return data;
  },
};
