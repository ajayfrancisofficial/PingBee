/**
 * useLocalChats.ts
 *
 * Observes all chats from WatermelonDB and exposes a `loadMore` function
 * for cursor-based pagination against the REST API.
 *
 * Returns:
 *  - chats         → live array, auto-updated by WatermelonDB
 *  - loadMore()    → fetch the next page from REST and upsert into DB
 *  - isLoadingMore → true while a page fetch is in flight
 *  - hasMore       → whether there are more pages to load
 */

import { useEffect, useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Chat from '../../db/models/Chat';
import { upsertChats } from '../../db/upsert';
import { fetchChats } from '../../api/chatApi';
import {
  getChatsCursor,
  setChatsCursor,
  getHasMoreChats,
  setHasMoreChats,
} from '../../utils/syncStorage';

export function useLocalChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(getHasMoreChats);

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

  // ── Load next page from REST ───────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !getHasMoreChats()) return;

    setIsLoadingMore(true);
    try {
      const cursor = getChatsCursor();
      if (!cursor) return; // Shouldn't happen if hasMore is true, but guard anyway

      const response = await fetchChats(cursor);

      await upsertChats(response.chats);

      setChatsCursor(response.next_cursor);
      setHasMoreChats(response.has_more);
      setHasMore(response.has_more);
    } catch (error) {
      console.error('[useLocalChats] loadMore failed:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore]);

  return { chats, loadMore, isLoadingMore, hasMore };
}
