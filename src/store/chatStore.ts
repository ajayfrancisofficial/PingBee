import { create } from 'zustand';

interface ChatState {
  /** ID of the chat currently open on screen, or null if none */
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;

  /** Map of chatId -> array of userIds who are currently typing */
  typingUsers: Record<string, string[]>;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>(set => ({
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),

  typingUsers: {},
  setTyping: (chatId, userId, isTyping) =>
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
    }),
}));
