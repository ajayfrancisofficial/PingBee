import { create } from 'zustand';

interface ChatState {
  /** ID of the chat currently open on screen, or null if none */
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;

  /** Map of chatId -> array of userIds who are currently typing */
  typingUsers: Record<string, string[]>;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
}

// Store typing timeouts globally outside the store to avoid serialization issues
const typingTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};
const TYPING_TIMEOUT_MS = 6000; // 6 seconds before clearing stale typing indicator

export const useChatStore = create<ChatState>((set, get) => ({
  activeChatId: null,
  setActiveChatId: id => set({ activeChatId: id }),

  typingUsers: {},
  setTyping: (chatId, userId, isTyping) => {
    const timeoutKey = `${chatId}-${userId}`;

    // Clear any existing stale timeout for this user in this chat
    if (typingTimeouts[timeoutKey]) {
      console.log('clearing timeou');

      clearTimeout(typingTimeouts[timeoutKey]);
      delete typingTimeouts[timeoutKey];
    }

    if (isTyping) {
      // Set a self-cleaning timeout to prevent sticking as typing
      typingTimeouts[timeoutKey] = setTimeout(() => {
        get().setTyping(chatId, userId, false);
      }, TYPING_TIMEOUT_MS);
    }

    set(state => {
      const current = state.typingUsers[chatId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter(id => id !== userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: updated,
        },
      };
    });
  },
}));
