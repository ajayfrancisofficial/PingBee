/**
 * chatApi.ts
 *
 * REST API client for chat and sync operations.
 * All functions return typed responses derived from src/types/api.ts.
 */

import { axiosInstance } from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import type {
  ApiChatListResponse,
  ApiMessageListResponse,
  MissedSyncResponse,
} from '../types/api';

/** How many chats to fetch per page */
export const CHATS_PAGE_SIZE = 20;

/** How many messages to fetch per page */
export const MESSAGES_PAGE_SIZE = 30;

// ─── Chats ───────────────────────────────────────────────────────────────────

/**
 * Fetch a page of chats, sorted by updated_at descending.
 * @param cursor - Pass the `next_cursor` from the previous response to get the next page.
 *                 Omit (or pass undefined) for the first page.
 */
export const fetchChats = async (
  cursor?: string,
): Promise<ApiChatListResponse> => {
  const params: Record<string, string | number> = {
    limit: CHATS_PAGE_SIZE,
  };
  if (cursor) {
    params.cursor = cursor;
  }

  const { data } = await axiosInstance.get<ApiChatListResponse>(
    ENDPOINTS.CHATS.LIST,
    { params },
  );
  return data;
};

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Fetch a page of messages for a chat, sorted by created_at descending
 * (newest first, same as GiftedChat expectation).
 * @param chatId - The chat to load messages for.
 * @param cursor - Pass the `next_cursor` from the previous response to fetch older messages.
 *                 Omit for the most-recent page.
 */
export const fetchMessages = async (
  chatId: string,
  cursor?: string,
): Promise<ApiMessageListResponse> => {
  const params: Record<string, string | number> = {
    limit: MESSAGES_PAGE_SIZE,
  };
  if (cursor) {
    params.cursor = cursor;
  }

  const { data } = await axiosInstance.get<ApiMessageListResponse>(
    ENDPOINTS.CHATS.MESSAGES(chatId),
    { params },
  );
  return data;
};

// ─── Missed Sync ─────────────────────────────────────────────────────────────

/**
 * Fetch all events that arrived on the server after `since` (Unix ms timestamp).
 * The server returns a flat ordered event stream.
 * @param since - The Unix ms timestamp of the last successful sync.
 */
export const fetchMissedSync = async (
  since: number,
): Promise<MissedSyncResponse> => {
  const { data } = await axiosInstance.get<MissedSyncResponse>(
    ENDPOINTS.SYNC.MISSED,
    { params: { since } },
  );
  return data;
};
