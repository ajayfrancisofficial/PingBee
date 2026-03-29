/**
 * syncStorage.ts
 *
 * MMKV-backed persistence for sync cursors and timestamps.
 * All values survive app kills and are read synchronously.
 *
 * Strategy:
 *   - lastSyncedAt    → used to skip missed-sync if data is fresh
 *   - chatsCursor     → cursor for the next page of /chats
 *   - hasMoreChats    → whether there are more chats to paginate
 *   - messagesCursor  → per-chatId cursor for /chats/:id/messages
 *   - hasMoreMessages → per-chatId flag
 *   - wsDisconnectedAt → when the WS last dropped (skip missed sync if gap < threshold)
 */

import { mmkvStorage } from './mmkvStorage';

// ─── Key helpers ────────────────────────────────────────────────────────────

const KEYS = {
  LAST_SYNCED_AT: 'sync:lastSyncedAt',
  WS_DISCONNECTED_AT: 'sync:wsDisconnectedAt',
  CHATS_CURSOR: 'sync:chatsCursor',
  HAS_MORE_CHATS: 'sync:hasMoreChats',
  messagesCursor: (chatId: string) => `sync:msgCursor:${chatId}`,
  hasMoreMessages: (chatId: string) => `sync:hasMoreMsg:${chatId}`,
  messagesLoaded: (chatId: string) => `sync:msgLoaded:${chatId}`,
} as const;

// ─── Freshness thresholds ────────────────────────────────────────────────────

/** If local data is newer than this, skip the initial REST chats load (5 min) */
export const CHATS_FRESHNESS_MS = 5 * 60 * 1000;

/** If the WS was only disconnected for this long, skip missed-sync (15 seconds) */
export const WS_GRACE_PERIOD_MS = 15 * 1000;

/** If the last sync was this recent, skip missed-sync entirely (60 seconds) */
export const SYNC_FRESHNESS_MS = 60 * 1000;

// ─── Last synced timestamp ───────────────────────────────────────────────────

export const getLastSyncedAt = (): number =>
  mmkvStorage.getNumberItem(KEYS.LAST_SYNCED_AT) ?? 0;

export const setLastSyncedAt = (ts: number): void =>
  mmkvStorage.setNumberItem(KEYS.LAST_SYNCED_AT, ts);

/** True if the last sync was recent enough that we can safely skip it */
export const isSyncFresh = (): boolean =>
  Date.now() - getLastSyncedAt() < SYNC_FRESHNESS_MS;

// ─── WebSocket disconnect timestamp ─────────────────────────────────────────

export const getWsDisconnectedAt = (): number =>
  mmkvStorage.getNumberItem(KEYS.WS_DISCONNECTED_AT) ?? 0;

export const setWsDisconnectedAt = (ts: number): void =>
  mmkvStorage.setNumberItem(KEYS.WS_DISCONNECTED_AT, ts);

/** True if the WS only dropped briefly (quick network blip) — skip missed sync */
export const wasShortDisconnect = (): boolean => {
  const disconnectedAt = getWsDisconnectedAt();
  if (disconnectedAt === 0) return false; // Never connected yet
  return Date.now() - disconnectedAt < WS_GRACE_PERIOD_MS;
};

// ─── Chats pagination cursor ─────────────────────────────────────────────────

export const getChatsCursor = (): string | null =>
  mmkvStorage.getStringItem(KEYS.CHATS_CURSOR) ?? null;

export const setChatsCursor = (cursor: string | null): void => {
  if (cursor === null) {
    mmkvStorage.removeItem(KEYS.CHATS_CURSOR);
  } else {
    mmkvStorage.setStringItem(KEYS.CHATS_CURSOR, cursor);
  }
};

export const getHasMoreChats = (): boolean =>
  mmkvStorage.getBooleanItem(KEYS.HAS_MORE_CHATS) ?? false;

export const setHasMoreChats = (val: boolean): void =>
  mmkvStorage.setBooleanItem(KEYS.HAS_MORE_CHATS, val);

/** True if chats local data is fresh enough to skip the initial REST call */
export const isChatsFresh = (): boolean =>
  Date.now() - getLastSyncedAt() < CHATS_FRESHNESS_MS;

// ─── Messages pagination cursor (per chat) ───────────────────────────────────

export const getMessagesCursor = (chatId: string): string | null =>
  mmkvStorage.getStringItem(KEYS.messagesCursor(chatId)) ?? null;

export const setMessagesCursor = (chatId: string, cursor: string | null): void => {
  if (cursor === null) {
    mmkvStorage.removeItem(KEYS.messagesCursor(chatId));
  } else {
    mmkvStorage.setStringItem(KEYS.messagesCursor(chatId), cursor);
  }
};

export const getHasMoreMessages = (chatId: string): boolean =>
  mmkvStorage.getBooleanItem(KEYS.hasMoreMessages(chatId)) ?? false;

export const setHasMoreMessages = (chatId: string, val: boolean): void =>
  mmkvStorage.setBooleanItem(KEYS.hasMoreMessages(chatId), val);

/**
 * Whether the first page of messages for this chat has been loaded.
 * Used by ChatScreen to show a loading spinner on first open.
 */
export const getMessagesLoaded = (chatId: string): boolean =>
  mmkvStorage.getBooleanItem(KEYS.messagesLoaded(chatId)) ?? false;

export const setMessagesLoaded = (chatId: string, val: boolean): void =>
  mmkvStorage.setBooleanItem(KEYS.messagesLoaded(chatId), val);
