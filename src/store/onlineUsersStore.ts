import { create } from 'zustand';

interface OnlineUsersState {
  /** Set of user IDs (as strings) currently online */
  onlineUserIds: Set<string>;

  /** Replace the entire online users set (called on each ONLINE_USERS event) */
  setOnlineUsers: (userIds: number[]) => void;

  /** Check if a specific user is online */
  isUserOnline: (userId: string) => boolean;

  /** Clear all online data (disconnect, logout, app kill) */
  clearOnlineUsers: () => void;
}

export const useOnlineUsersStore = create<OnlineUsersState>((set, get) => ({
  onlineUserIds: new Set<string>(),

  setOnlineUsers: (userIds: number[]) => {
    set({ onlineUserIds: new Set(userIds.map(String)) });
  },

  isUserOnline: (userId: string) => {
    return get().onlineUserIds.has(userId);
  },

  clearOnlineUsers: () => {
    set({ onlineUserIds: new Set<string>() });
  },
}));
