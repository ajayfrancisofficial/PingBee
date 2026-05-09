/**
 * useLocalChats.ts
 *
 * Observes all chats from WatermelonDB. On every screen focus, fetches the
 * latest chats from the REST API and upserts them into the local DB. The
 * WatermelonDB observer automatically propagates the changes to the UI.
 *
 * Returns:
 *  - chats      → live array, auto-updated by WatermelonDB
 *  - isSyncing  → true while a background fetch is in flight
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { chatApi } from '../../api/RESTApi/chatApi';
import { upsertChats } from '../../db/upsert';

export function useLocalChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const isFetchingRef = useRef(false);

  // ── Live WatermelonDB observer ─────────────────────────────────────────────
  useEffect(() => {
    const subscription = database
      .get<Chat>('chats')
      .query(Q.sortBy('updated_at', Q.desc))
      .observe()
      .subscribe(newChats => {
        setChats(newChats);
      });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch & upsert on every focus ─────────────────────────────────────────
  const syncChats = useCallback(async () => {
    if (isFetchingRef.current) return; // prevent concurrent fetches
    isFetchingRef.current = true;
    setIsSyncing(true);
    try {
      const response = await chatApi.fetchChats();
      const apiChats = response.data?.chats ?? [];
      await upsertChats(apiChats);
    } catch (error) {
      console.error('[useLocalChats] Sync failed:', error);
    } finally {
      isFetchingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncChats();
    }, [syncChats]),
  );

  return { chats, isSyncing };
}
