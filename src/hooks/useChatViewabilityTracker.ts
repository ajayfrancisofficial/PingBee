import { useEffect, useRef, useState } from 'react';
import { ViewToken, ViewabilityConfig } from 'react-native';
import { websocketApi } from '../api/WebsocketApi/websocketApi';
import { database } from '../db';
import Chat from '../db/models/Chat';

export interface ViewableChatItem {
  type: string;
  message?: {
    id: string;
    chatId: string;
    createdAt: string | number;
    isMine: boolean;
    status: string;
  };
  date?: Date;
}

/**
 * Custom hook to track scroll position and manage the active date separator
 * that floats at the top of the chat viewport.
 * Now also triggers mark-as-read status updates via WebSocket every 2 seconds
 * for the latest visible unread message.
 */
export function useChatViewabilityTracker<
  T extends ViewableChatItem = ViewableChatItem,
>(listLength: number) {
  const [floatingDate, setFloatingDate] = useState<Date | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [minVisibleIndex, setMinVisibleIndex] = useState(0);

  const listLengthRef = useRef(listLength);
  useEffect(() => {
    listLengthRef.current = listLength;
  }, [listLength]);

  // Keep track of the latest unread message in the current viewport
  const latestUnreadRef = useRef<ViewableChatItem['message'] | null>(null);
  const lastMarkedIdRef = useRef<string | null>(null);

  // Poll/interval to send read status update every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = latestUnreadRef.current;
      if (msg && msg.id !== lastMarkedIdRef.current) {
        lastMarkedIdRef.current = msg.id;

        if (websocketApi.getIsConnected()) {
          console.log(
            '[useChatViewabilityTracker] Marking message as read:',
            msg.id,
          );
          websocketApi.sendRaw({
            event: 'MSG_STATUS',
            payload: {
              messageId: msg.id,
              status: 'read',
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      // 1. Process for mark-as-read (find latest visible unread message from others)
      const unreadMessages = viewableItems
        .filter(
          entry =>
            entry.index !== null &&
            entry.index !== undefined &&
            entry.item &&
            entry.item.type === 'message' &&
            entry.item.message &&
            !entry.item.message.isMine &&
            entry.item.message.status !== 'read',
        )
        .map(entry => ({
          index: entry.index!,
          message: entry.item.message as NonNullable<
            ViewableChatItem['message']
          >,
        }));

      if (unreadMessages.length > 0) {
        // Find the one with the smallest index (latest in creation order/listData structure)
        let latestUnread = unreadMessages[0];
        for (let i = 1; i < unreadMessages.length; i++) {
          if (unreadMessages[i].index < latestUnread.index) {
            latestUnread = unreadMessages[i];
          }
        }
        latestUnreadRef.current = latestUnread.message;
      } else {
        latestUnreadRef.current = null;
      }

      // 2. Process for floating date separator
      // Filter to entries with valid index and expected types
      const validEntries = viewableItems.filter(
        entry =>
          entry.index !== null &&
          entry.index !== undefined &&
          entry.item &&
          (entry.item.type === 'message' || entry.item.type === 'separator'),
      );

      if (validEntries.length > 0) {
        // Find the entry with the highest index (visual top of the inverted list)
        let topEntry = validEntries[0];
        for (let i = 1; i < validEntries.length; i++) {
          if (
            validEntries[i].index !== null &&
            topEntry.index !== null &&
            validEntries[i].index! > topEntry.index!
          ) {
            topEntry = validEntries[i];
          }
        }

        const topItem = topEntry.item as T;
        let itemDate: Date;
        if (topItem.type === 'separator' && topItem.date) {
          itemDate = new Date(topItem.date);
        } else if (topItem.type === 'message' && topItem.message) {
          itemDate = new Date(Number(topItem.message.createdAt));
        } else {
          return;
        }

        // Check if the oldest item in the list is visible
        const oldestIndexVisible = viewableItems.some(
          entry => entry.index === listLengthRef.current - 1,
        );

        if (oldestIndexVisible) {
          setFloatingDate(null);
        } else {
          setFloatingDate(itemDate);
        }
      }

      // 3. Track if we are at the bottom of the list (index 0 is visible) and min index
      const bottomVisible = viewableItems.some(entry => entry.index === 0);
      setIsAtBottom(bottomVisible);

      //4.  Set the minimum index that is visible.
      const indices = viewableItems
        .map(entry => entry.index)
        .filter((idx): idx is number => idx !== null && idx !== undefined);
      if (indices.length > 0) {
        setMinVisibleIndex(Math.min(...indices));
      }
    },
  ).current;

  const viewabilityConfig = useRef<ViewabilityConfig>({
    viewAreaCoveragePercentThreshold: 90,
  }).current;

  return {
    floatingDate,
    isAtBottom,
    minVisibleIndex,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
