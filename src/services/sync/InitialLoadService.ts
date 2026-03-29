/**
 * InitialLoadService.ts
 *
 * Runs once after the user logs in (or on every launch if data is stale).
 *
 * What it does:
 *  1. Checks if local chats data is fresh (< 5 minutes old) — skips if so.
 *  2. Fetches page 1 of the chats list from REST and upserts into WatermelonDB.
 *  3. Stores the next cursor + hasMore flag in MMKV for future pagination.
 *  4. Updates lastSyncedAt so the freshness guard works on next launch.
 *
 * Messages are NOT pre-fetched here — they load lazily when the user opens
 * a chat (see useLocalMessages hook). This keeps launch time short.
 */

import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { upsertChats } from '../../db/upsert';
import { fetchChats } from '../../api/chatApi';
import {
  isChatsFresh,
  setChatsCursor,
  setHasMoreChats,
  setLastSyncedAt,
} from '../../utils/syncStorage';

let isRunning = false;

/**
 * Run the initial data load.
 * Safe to call multiple times — it will not run concurrently.
 *
 * @param force - Set to true to bypass the freshness check and always reload.
 */
export const runInitialLoad = async (force = false): Promise<void> => {
  if (isRunning) {
    console.log('[InitialLoad] Already running, skipping.');
    return;
  }

  isRunning = true;

  try {
    // ── Freshness guard ──────────────────────────────────────────────────────
    if (!force && isChatsFresh()) {
      const count = await database.get<Chat>('chats').query().fetchCount();
      if (count > 0) {
        console.log('[InitialLoad] Data is fresh and local DB is populated — skipping REST call.');
        return;
      }
      // DB is empty even though timestamp says fresh (e.g. DB was cleared)
      // Fall through to fetch
    }

    console.log('[InitialLoad] Fetching chats from server...');

    const response = await fetchChats(); // No cursor → first page

    await upsertChats(response.chats);

    // Store pagination state for "load more" in ChatsScreen
    setChatsCursor(response.next_cursor);
    setHasMoreChats(response.has_more);

    // Mark sync as fresh so the next launch can skip this call
    setLastSyncedAt(Date.now());

    console.log(
      `[InitialLoad] Done. Loaded ${response.chats.length} chats. hasMore=${response.has_more}`,
    );
  } catch (error) {
    console.error('[InitialLoad] Failed to load chats:', error);
    // Don't update lastSyncedAt on failure — next launch will retry
  } finally {
    isRunning = false;
  }
};
