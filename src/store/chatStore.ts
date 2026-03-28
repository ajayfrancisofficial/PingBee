import { create } from 'zustand';

interface ChatState {
  /** ID of the chat currently open on screen, or null if none */
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>(set => ({
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),
}));
