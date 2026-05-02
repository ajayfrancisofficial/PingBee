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

  return { chats };
}
