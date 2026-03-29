/**
 * api.ts
 *
 * Typed interfaces for all REST API responses.
 * Field names match the WatermelonDB column names exactly (snake_case)
 * so that the upsert layer can map them directly without transformation.
 */

// ─── Chats ───────────────────────────────────────────────────────────────────

export interface ApiChat {
  id: string;
  name: string;
  type: 'individual' | 'group';
  last_message_text: string | null;
  unread_count: number;
  updated_at: number; // Unix ms timestamp
  avatar_url: string | null;
}

export interface ApiChatListResponse {
  chats: ApiChat[];
  /** Opaque cursor for the next page. null means no more pages. */
  next_cursor: string | null;
  has_more: boolean;
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface ApiMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'file' | null;
  status: 'sent' | 'delivered' | 'read';
  is_mine: boolean;
  reply_to_id: string | null;
  is_edited: boolean;
  edited_at: number | null; // Unix ms
  is_deleted: boolean;
  deleted_at: number | null; // Unix ms
  delete_type: 'deleteForEveryone' | 'deleteForMe' | null;
  created_at: number; // Unix ms
  server_timestamp: number;
}

export interface ApiMessageListResponse {
  messages: ApiMessage[];
  /** Cursor pointing to the oldest message in this page (for fetching earlier messages). */
  next_cursor: string | null;
  has_more: boolean;
}

// ─── Missed Sync ─────────────────────────────────────────────────────────────

/**
 * The server returns a flat event stream for missed sync.
 * Each event mirrors the WebSocket incoming payloads so the same
 * handler logic can be reused.
 */
export type MissedSyncEventType =
  | 'NEW_MSG'
  | 'EDIT_MSG'
  | 'DELETE_MSG'
  | 'MSG_STATUS';

export interface MissedSyncNewMsg {
  type: 'NEW_MSG';
  payload: {
    id: string;
    chat_id: string;
    sender_id: string;
    text: string;
    media_url: string | null;
    media_type: 'image' | 'video' | 'file' | null;
    reply_to_id: string | null;
    created_at: number;
    server_timestamp: number;
  };
}

export interface MissedSyncEditMsg {
  type: 'EDIT_MSG';
  payload: {
    id: string;
    text: string;
    edited_at: number;
  };
}

export interface MissedSyncDeleteMsg {
  type: 'DELETE_MSG';
  payload: {
    id: string;
    delete_type: 'deleteForEveryone' | 'deleteForMe';
    deleted_at: number;
  };
}

export interface MissedSyncMsgStatus {
  type: 'MSG_STATUS';
  payload: {
    id: string;
    status: 'delivered' | 'read';
  };
}

export type MissedSyncEvent =
  | MissedSyncNewMsg
  | MissedSyncEditMsg
  | MissedSyncDeleteMsg
  | MissedSyncMsgStatus;

export interface MissedSyncResponse {
  events: MissedSyncEvent[];
  /** Server's current timestamp — used to update lastSyncedAt */
  synced_at: number;
}
