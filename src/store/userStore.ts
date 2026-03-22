import { create } from 'zustand';

interface UserState {
  userId: string;
  name: string;
  about: string;
  phoneNumber: string;
  email: string;
  profilePicture: string;
  avatar: string;
  setUser: (user: Partial<Omit<UserState, 'setUser'>>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: 'user-1',
  name: 'Ajay',
  about: 'sample about',
  phoneNumber: '+91 89215 68816',
  email: 'ajay@pingbee.app',
  profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',

  setUser: (user) => set((state) => ({ ...state, ...user })),
}));
