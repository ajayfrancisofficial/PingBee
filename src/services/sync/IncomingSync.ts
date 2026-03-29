/**
 * IncomingSync.ts
 *
 * Fetches all server events the device missed while it was offline/killed.
 * Called on WebSocket reconnection (after InitialLoad has populated the DB).
 *
 * Skip conditions (to avoid unnecessary REST calls):
 *  - Data was synced very recently (< 60 seconds) → skip
 *  - WS was only disconnected briefly (< 15 second gap) → skip (quick network blip)
 */

import { fetchMissedSync } from '../../api/chatApi';
import { applyMissedSyncEvents } from '../../db/upsert';
import {
  getLastSyncedAt,
  setLastSyncedAt,
  isSyncFresh,
  wasShortDisconnect,
} from '../../utils/syncStorage';

let isSyncing = false;

/**
 * Fetch and apply all missed events since the last successful sync.
 * Safe to call multiple times — will not run concurrently.
 */
export const performIncomingSync = async (): Promise<void> => {
  if (isSyncing) {
    console.log('[IncomingSync] Already syncing, skipping.');
    return;
  }

  // ── Skip guards ────────────────────────────────────────────────────────────

  if (wasShortDisconnect()) {
    console.log('[IncomingSync] WS dropped briefly — skipping missed sync.');
    return;
  }

  if (isSyncFresh()) {
    console.log('[IncomingSync] Data is fresh — skipping missed sync.');
    return;
  }

  isSyncing = true;

  try {
    const since = getLastSyncedAt();
    console.log('[IncomingSync] Fetching missed events since:', new Date(since).toISOString());

    const response = await fetchMissedSync(since);

    if (response.events.length === 0) {
      console.log('[IncomingSync] No missed events.');
    } else {
      console.log(`[IncomingSync] Applying ${response.events.length} missed event(s)...`);
      await applyMissedSyncEvents(response.events);
      console.log('[IncomingSync] Done.');
    }

    // Always update the timestamp to the server's clock on success
    setLastSyncedAt(response.synced_at);
  } catch (error) {
    console.error('[IncomingSync] Failed:', error);
    // Do not update lastSyncedAt — will retry on next reconnection
  } finally {
    isSyncing = false;
  }
};
