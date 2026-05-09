/**
 * useLocalChats.ts
 *
 * Observes all chats from WatermelonDB. On every screen focus, fetches the
 * latest chats from the REST API and upserts them into the local DB. The
 * WatermelonDB observer automatically propagates the changes to the UI.
 *
 * Returns:
 *  - chats        → live array, auto-updated by WatermelonDB
 *  - isSyncing    → true while the background focus-fetch is in flight
 *  - refreshChats → pull-to-refresh callback for FlatList
 *  - isRefreshing → true while pull-to-refresh is in flight
 */

import { useEffect, useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { useFocusEffect } from '@react-navigation/native';
import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { chatApi } from '../../api/RESTApi/chatApi';
import { upsertChats } from '../../db/upsert';
import { useGuardedFetch } from '../useGuardedFetch';

export function useLocalChats() {
  const [chats, setChats] = useState<Chat[]>([]);

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

  // ── Shared fetch logic ─────────────────────────────────────────────────────
  const fetchAndUpsert = useCallback(async () => {
    const response = await chatApi.fetchChats();
    const apiChats = response.data?.chats ?? [];
    await upsertChats(apiChats);
  }, []);

  // ── Fetch & upsert on every focus ─────────────────────────────────────────
  const { execute: syncChats, isLoading: isSyncing } = useGuardedFetch(
    fetchAndUpsert,
    'useLocalChats:sync',
  );

  useFocusEffect(
    useCallback(() => {
      syncChats();
    }, [syncChats]),
  );

  // ── Pull-to-refresh (reuses the same fetch logic) ─────────────────────────
  const { execute: refreshChats, isLoading: isRefreshing } = useGuardedFetch(
    fetchAndUpsert,
    'useLocalChats:refresh',
  );

  return { chats, isSyncing, refreshChats, isRefreshing };
}
