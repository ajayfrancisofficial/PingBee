import { useState, useCallback, useMemo } from 'react';
import Message from '../db/models/Message';

export interface MultiSelectState {
  /** Whether we are currently in multi-select mode */
  isSelectionMode: boolean;
  /** Set of currently selected message IDs */
  selectedIds: Set<string>;
  /** Number of selected messages */
  selectedCount: number;
  /**
   * Whether "Delete for Everyone" is eligible.
   * True only when ALL selected messages are mine.
   */
  canDeleteForEveryone: boolean;
  /** Enter selection mode and immediately select the given message */
  startSelection: (message: Message) => void;
  /** Toggle a message's selection state while in selection mode */
  toggleSelection: (message: Message) => void;
  /** Exit selection mode and clear the selection */
  clearSelection: () => void;
}

/**
 * Manages the multi-select state for the ChatScreen.
 *
 * - Long-pressing a message enters selection mode and selects that message.
 * - Tapping any message while in selection mode toggles its selection.
 * - "Delete for Everyone" is eligible when every selected message is mine.
 */
export const useMultiSelectMode = (
  rawMessages: Message[],
): MultiSelectState => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Keep a fast id→Message lookup so eligibility checks are O(1) per message
  const messageMap = useMemo<Map<string, Message>>(
    () => new Map(rawMessages.map(m => [m.id, m])),
    [rawMessages],
  );

  const canDeleteForEveryone = useMemo<boolean>(() => {
    if (selectedIds.size === 0) return false;
    for (const id of selectedIds) {
      const msg = messageMap.get(id);
      // Must exist and belong to me
      if (!msg || !msg.isDeletable) return false;
    }
    return true;
  }, [selectedIds, messageMap]);

  const startSelection = useCallback((message: Message) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set([message.id]));
  }, []);

  const toggleSelection = useCallback((message: Message) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(message.id)) {
        next.delete(message.id);
      } else {
        next.add(message.id);
      }
      // Auto-exit if nothing is selected after toggling off
      if (next.size === 0) {
        setIsSelectionMode(false);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  return {
    isSelectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    canDeleteForEveryone,
    startSelection,
    toggleSelection,
    clearSelection,
  };
};
