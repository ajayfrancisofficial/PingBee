import { useEffect, useState, useCallback } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Message from '../../db/models/Message';
import { DBService } from '../../services/DB/DBService';
import { chatApi, MESSAGES_PAGE_SIZE } from '../../api/RESTApi/chatApi';
import {
  getHasMoreMessages,
  setHasMoreMessages,
} from '../../utils/syncStorage';
import { useGuardedFetch } from '../useGuardedFetch';

export type LocalMessage = Message & { replyMessage?: Message };

export function useLocalMessages(chatId: string, currentUserId: string) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => getHasMoreMessages(chatId));

  // ─── 1. Observe WatermelonDB ───────────────────────────────────────────────
  useEffect(() => {
    const subscription = database
      .get<Message>('messages')
      .query(
        Q.where('chat_id', chatId),
        Q.where('is_deleted_for_me', Q.notEq(true)),
        Q.sortBy('created_time', Q.desc),
      )
      .observeWithColumns([
        'status',
        'text',
        'is_edited',
        'is_deleted_for_everyone',
      ])
      .subscribe(async newMessages => {
        // Fetch replied messages in bulk
        const replyToIds = [
          ...new Set(newMessages.map(m => m.replyToId).filter(Boolean)),
        ] as string[];
        const replyMap: Record<string, Message> = {};

        if (replyToIds.length > 0) {
          try {
            const replies = await database
              .get<Message>('messages')
              .query(Q.where('id', Q.oneOf(replyToIds)))
              .fetch();

            replies.forEach(r => {
              replyMap[r.id] = r;
            });
          } catch (error) {
            console.error(
              '[useLocalMessages] Failed to fetch replied messages:',
              error,
            );
          }
        }

        const enhancedMessages = newMessages.map(m => {
          // Clone the model or use a proxy to avoid mutating WatermelonDB's cached instances
          // A proxy ensures all methods (like .isMine) still work correctly.
          return new Proxy(m, {
            get(target, prop, receiver) {
              if (prop === 'replyMessage') {
                return m.replyToId ? replyMap[m.replyToId] : undefined;
              }
              return Reflect.get(target, prop, receiver);
            },
          }) as LocalMessage;
        });

        setMessages(enhancedMessages);
      });

    return () => subscription.unsubscribe();
  }, [chatId]);

  // ─── Shared fetch-page-0 logic ─────────────────────────────────────────────
  // Used by both the initial mount load and pull-to-refresh.
  const fetchLatestPage = useCallback(async () => {
    const response = await chatApi.fetchMessages(chatId, 0);
    const fetchedMessages = response.data?.messages ?? [];
    await DBService.upsertMessages(fetchedMessages, chatId, currentUserId);

    const hasMoreMsgs = fetchedMessages.length >= MESSAGES_PAGE_SIZE;
    setHasMoreMessages(chatId, hasMoreMsgs);
    setHasMore(hasMoreMsgs);
  }, [chatId, currentUserId]);

  // ─── 2. Fetch First Page on Open ──────────────────────────────────────────
  const { execute: loadInitial, isLoading: isInitialLoading } = useGuardedFetch(
    fetchLatestPage,
    'useLocalMessages:initial',
  );

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // ─── 3. Load More (Cursor-based Pagination) ──────────────────────────────
  //
  // Uses the actual WatermelonDB message count for this chat as the skip
  // offset, avoiding skip-drift when new messages arrive between pages.
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !getHasMoreMessages(chatId)) return;

    setIsLoadingMore(true);
    try {
      const localCount = await database
        .get<Message>('messages')
        .query(
          Q.where('chat_id', chatId),
          Q.where('is_deleted_for_me', Q.notEq(true)),
        )
        .fetchCount();

      const response = await chatApi.fetchMessages(chatId, localCount);
      const fetchedMessages = response.data?.messages ?? [];
      await DBService.upsertMessages(fetchedMessages, chatId, currentUserId);

      const hasMoreMsgs = fetchedMessages.length >= MESSAGES_PAGE_SIZE;
      setHasMoreMessages(chatId, hasMoreMsgs);
      setHasMore(hasMoreMsgs);
    } catch (error) {
      console.error('[useLocalMessages] loadMore failed:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, isLoadingMore, currentUserId]);

  // ─── 4. Pull-to-Refresh (reuses the same fetch logic) ────────────────────
  const { execute: refreshMessages, isLoading: isRefreshing } = useGuardedFetch(
    fetchLatestPage,
    'useLocalMessages:refresh',
  );

  return {
    messages,
    loadMore,
    refreshMessages,
    isLoadingMore,
    isInitialLoading,
    isRefreshing,
    hasMore,
  };
}
