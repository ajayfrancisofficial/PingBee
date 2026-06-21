import { useEffect, useState, useCallback } from 'react';
import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { pingyApi } from '../../api/RESTApi/pingyApi';
import { DBService } from '../../services/DB/DBService';
import { useGuardedFetch } from '../useGuardedFetch';

/**
 * Fetches Pingy chatbot details from the API, persists them to WatermelonDB,
 * and reactively observes the Pingy chat record.
 *
 * Returns:
 *  - `pingyChat`       → the Chat model record for Pingy, or null if unavailable.
 *  - `pingyUserId`       → the pingyUserId for Pingy (for route params).
 *  - `isLoading`       → true while the initial fetch is in flight.
 */
export function usePingyDetails() {
  const [pingyChat, setPingyChat] = useState<Chat | null>(null);
  const [pingyUserId, setPingyUserId] = useState<string | null>(null);
  const [pingyChatId, setPingyChatId] = useState<string | null>(null);

  // ── Fetch from API & upsert to DB ──────────────────────────────────────────
  const fetchAndUpsert = useCallback(async () => {
    const response = await pingyApi.fetchPingyDetails();
    if (response.success && response.data) {
      const { data } = response;
      if (!data.isEnabled) {
        // Server disabled Pingy — clear local state
        setPingyChat(null);
        setPingyUserId(null);
        setPingyChatId(null);
        return;
      }
      setPingyUserId(String(data.pingyUserId));
      setPingyChatId(String(data.chatId));
      await DBService.upsertPingyChat(data);
    }
  }, []);

  const { execute: syncPingy, isLoading } = useGuardedFetch(
    fetchAndUpsert,
    'usePingyDetails:sync',
  );

  // ── Trigger fetch on mount ─────────────────────────────────────────────────
  useEffect(() => {
    syncPingy();
  }, [syncPingy]);

  // ── Observe the Pingy chat record from WatermelonDB ────────────────────────
  useEffect(() => {
    if (!pingyChatId) return;

    const subscription = database
      .get<Chat>('chats')
      .findAndObserve(pingyChatId)
      .subscribe({
        next: chat => setPingyChat(chat),
        error: () => setPingyChat(null),
      });

    return () => subscription.unsubscribe();
  }, [pingyChatId]);

  return { pingyChat, pingyUserId, isLoading };
}
