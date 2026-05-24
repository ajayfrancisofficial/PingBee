import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MediaUtils } from '../utils/media';
import { zustandStorage } from '../utils/mmkvStorage';

interface UserState {
  userId: number | null;
  username: string;
  email: string;
  isVerified: boolean;
  name: string;
  about: string;
  phoneNumber: string;
  profilePicture: string; // use "" if deleted
  avatar: string; // use "" if deleted
  setUser: (
    user: Partial<
      Omit<
        UserState,
        'setUser' | 'updateProfilePicture' | 'deleteProfilePicture' | 'clearUser'
      >
    >,
  ) => void;
  updateProfilePicture: (url: string) => Promise<void>;
  deleteProfilePicture: () => void;
  clearUser: () => void;
}

const initialState = {
  userId: null,
  username: '',
  email: '',
  isVerified: false,
  name: '',
  about: '',
  phoneNumber: '',
  profilePicture: '',
  avatar: '',
};

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      ...initialState,

      setUser: user => set(state => ({ ...state, ...user })),

      updateProfilePicture: async (url: string) => {
        // Instantly set the profile picture for immediate UI feedback
        set(state => ({ ...state, profilePicture: url }));

        try {
          // Create a compressed avatar version
          const avatarUrl = await MediaUtils.compressImage(url, 0.4); // 40% quality thumbnail

          set(state => ({ ...state, avatar: avatarUrl }));
        } catch (error) {
          console.error(
            '[UserStore] Failed to generate avatar from profile picture',
            error,
          );
          // Fallback to the original URL if compression fails
          set(state => ({ ...state, avatar: url }));
        }
      },

      deleteProfilePicture: () =>
        set(state => ({
          ...state,
          profilePicture: '',
          avatar: '',
        })),

      clearUser: () => set(initialState),
    }),
    {
      name: 'pingbee-user-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
