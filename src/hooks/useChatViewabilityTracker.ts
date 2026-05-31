import { useRef, useState } from 'react';
import { ViewToken, ViewabilityConfig } from 'react-native';

export interface ViewableChatItem {
  type: string;
  message?: { createdAt: string | number };
  date?: Date;
}

/**
 * Custom hook to track scroll position and manage the active date separator
 * that floats at the top of the chat viewport.
 */
export function useChatViewabilityTracker<
  T extends ViewableChatItem = ViewableChatItem,
>() {
  const [floatingDate, setFloatingDate] = useState<Date | null>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      // Filter to entries with valid index and expected types
      const validEntries = viewableItems.filter(
        entry =>
          entry.index !== null &&
          entry.index !== undefined &&
          entry.item &&
          (entry.item.type === 'message' || entry.item.type === 'separator'),
      );

      if (validEntries.length === 0) return;

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

      setFloatingDate(itemDate);
    },
  ).current;

  const viewabilityConfig = useRef<ViewabilityConfig>({
    viewAreaCoveragePercentThreshold: 90,
  }).current;

  return {
    floatingDate,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
