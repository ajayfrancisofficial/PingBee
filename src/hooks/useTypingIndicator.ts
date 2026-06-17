import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useOnlineUsersStore } from '../store/onlineUsersStore';
import { sendTypingStatus } from '../services/Chat/messageController';

/** How long after the last keystroke before we send isTyping: false */
const TYPING_DEBOUNCE_MS = 2500;

export interface UseTypingIndicatorResult {
  /** IDs of remote users currently typing in this chat (self excluded) */
  typingUserIds: string[];
  /**
   * Call with `true` on every keystroke, `false` on send/clear.
   * Internally debounces the outgoing WS events so we don't spam the server.
   */
  notifyTyping: (isTyping: boolean) => void;
}

/**
 * Manages typing indicator state for a chat.
 *
 * Outgoing: debounces `sendTypingStatus` so a single WS frame is emitted
 *   when typing starts, and another when it stops (or after 2.5 s idle).
 *
 * Incoming: reads `typingUsers[chatId]` from the Zustand chatStore (already
 *   populated by `websocketService`) and returns remote typer IDs.
 */
export const useTypingIndicator = (
  chatId: string,
): UseTypingIndicatorResult => {
  const { userId } = useUserStore();
  const typingUsers = useChatStore(state => state.typingUsers);
  const onlineUserIds = useOnlineUsersStore(state => state.onlineUserIds);

  /** Whether we have already sent isTyping: true to the server */
  const isCurrentlyTypingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (isTyping) {
        // Send isTyping: true only once per typing session
        if (!isCurrentlyTypingRef.current) {
          isCurrentlyTypingRef.current = true;
          sendTypingStatus(chatId, true);
        }

        // Always reset the idle debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          isCurrentlyTypingRef.current = false;
          debounceTimerRef.current = null;
          sendTypingStatus(chatId, false);
        }, TYPING_DEBOUNCE_MS);
      } else {
        // Immediate stop (on send / clear)
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        if (isCurrentlyTypingRef.current) {
          isCurrentlyTypingRef.current = false;
          sendTypingStatus(chatId, false);
        }
      }
    },
    [chatId],
  );

  // Cleanup: send isTyping: false if the screen is unmounted while typing
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (isCurrentlyTypingRef.current) {
        isCurrentlyTypingRef.current = false;
        sendTypingStatus(chatId, false);
      }
    };
  }, [chatId]);

  // Filter self out AND filter to only online users
  const typingUserIds = (typingUsers[chatId] ?? []).filter(
    id => id !== String(userId) && onlineUserIds.has(id),
  );

  return { typingUserIds, notifyTyping };
};
