import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  setLoggedIn: (status: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLoading: true, // true until we check the keychain on mount
  
  setLoggedIn: (status) => set({ isLoggedIn: status }),
  
  logout: async () => {
    await Keychain.resetGenericPassword({ service: 'accessToken' });
    await Keychain.resetGenericPassword({ service: 'refreshToken' });
    set({ isLoggedIn: false });
  },

  checkAuth: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'accessToken' });
      // If we have an access token, consider logged in initially
      set({ isLoggedIn: !!credentials, isLoading: false });
    } catch (e) {
      set({ isLoggedIn: false, isLoading: false });
    }
  },
}));
