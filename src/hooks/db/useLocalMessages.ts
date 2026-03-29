import { useEffect, useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Message from '../../db/models/Message';
import { upsertMessages } from '../../db/upsert';
import { fetchMessages } from '../../api/chatApi';
import {
  getMessagesCursor,
  setMessagesCursor,
  getHasMoreMessages,
  setHasMoreMessages,
  getMessagesLoaded,
  setMessagesLoaded,
} from '../../utils/syncStorage';

export function useLocalMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() => getHasMoreMessages(chatId));

  // ─── 1. Observe WatermelonDB ───────────────────────────────────────────────
  useEffect(() => {
    const subscription = database
      .get<Message>('messages')
      .query(Q.where('chat_id', chatId), Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe(newMessages => {
        setMessages(newMessages);
      });

    return () => subscription.unsubscribe();
  }, [chatId]);

  // ─── 2. Lazy Load (First Page) ────────────────────────────────────────────
  useEffect(() => {
    const loadInitial = async () => {
      // If we haven't loaded the first page for this chat yet, do it now
      if (!getMessagesLoaded(chatId)) {
        setIsInitialLoading(true);
        try {
          const response = await fetchMessages(chatId);
          await upsertMessages(response.messages);
          
          setMessagesCursor(chatId, response.next_cursor);
          setHasMoreMessages(chatId, response.has_more);
          setHasMore(response.has_more);
          setMessagesLoaded(chatId, true);
        } catch (error) {
          console.error('[useLocalMessages] Initial load failed:', error);
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    loadInitial();
  }, [chatId]);

  // ─── 3. Load More (Pagination) ───────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !getHasMoreMessages(chatId)) return;

    setIsLoadingMore(true);
    try {
      const cursor = getMessagesCursor(chatId);
      if (!cursor) return;

      const response = await fetchMessages(chatId, cursor);
      await upsertMessages(response.messages);

      setMessagesCursor(chatId, response.next_cursor);
      setHasMoreMessages(chatId, response.has_more);
      setHasMore(response.has_more);
    } catch (error) {
      console.error('[useLocalMessages] loadMore failed:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, isLoadingMore]);

  return {
    messages,
    loadMore,
    isLoadingMore,
    isInitialLoading,
    hasMore,
  };
}
