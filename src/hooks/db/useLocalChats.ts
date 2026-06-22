import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { chatApi } from '../../api/RESTApi/chatApi';
import { DBService } from '../../services/DB/DBService';
import { useGuardedFetch } from '../useGuardedFetch';

/**
 * Observes all chats from WatermelonDB. On every screen focus, fetches the
 * latest chats from the REST API and upserts them into the local DB. The
 * WatermelonDB observer automatically propagates the changes to the UI.
 *
 * @returns An object containing:
 *  - `chats`: Live array of chats, auto-updated by WatermelonDB.
 *  - `isSyncing`: True while the background focus-fetch is in flight.
 *  - `refreshChats`: Pull-to-refresh callback for FlatList.
 *  - `isRefreshing`: True while pull-to-refresh is in flight.
 */
export function useLocalChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const isFocused = useIsFocused();

  // ── Live WatermelonDB observer ─────────────────────────────────────────────
  useEffect(() => {
    const subscription = database
      .get<Chat>('chats')
      .query(Q.sortBy('last_updated_at', Q.desc))
      .observe()
      .subscribe(newChats => {
        setChats(newChats);
        const count = newChats.filter(c => c.unreadCount > 0).length;
        setUnreadChatsCount(count);
      });

    return () => subscription.unsubscribe();
  }, []);

  // ── Shared fetch logic ─────────────────────────────────────────────────────
  const fetchAndUpsert = useCallback(async () => {
    const response = await chatApi.fetchChats();
    const apiChats = response.data?.chats ?? [];
    await DBService.upsertChats(apiChats);
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

  // ── Sync on app foregrounding ──────────────────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isFocused) {
        syncChats();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [syncChats, isFocused]);

  // ── Pull-to-refresh (reuses the same fetch logic) ─────────────────────────
  const { execute: refreshChats, isLoading: isRefreshing } = useGuardedFetch(
    fetchAndUpsert,
    'useLocalChats:refresh',
  );

  return { chats, isSyncing, refreshChats, isRefreshing, unreadChatsCount };
}
