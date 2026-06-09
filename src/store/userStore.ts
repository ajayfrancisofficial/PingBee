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
        | 'setUser'
        | 'updateProfilePicture'
        | 'deleteProfilePicture'
        | 'clearUser'
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
        if (!url) {
          set(state => ({ ...state, profilePicture: '', avatar: '' }));
          return;
        }

        // Instantly set the profile picture for immediate UI feedback (could be local path or remote URL)
        set(state => ({ ...state, profilePicture: url }));

        try {
          let targetPath = url;
          // If the URL is remote, download it to the local cache first
          if (url.startsWith('http://') || url.startsWith('https://')) {
            targetPath = await MediaUtils.downloadMedia(url);
            // Ensure local cached path is prefixed with file://
            const localUri = targetPath.startsWith('file://')
              ? targetPath
              : `file://${targetPath}`;
            set(state => ({ ...state, profilePicture: localUri }));
          }

          // Create a compressed avatar version (40% quality thumbnail)
          let avatarUrl = await MediaUtils.compressImage(targetPath, 0.4);
          if (
            avatarUrl &&
            !avatarUrl.startsWith('file://') &&
            !avatarUrl.startsWith('http')
          ) {
            avatarUrl = `file://${avatarUrl}`;
          }

          set(state => ({ ...state, avatar: avatarUrl }));
        } catch (error) {
          console.error(
            '[UserStore] Failed to generate avatar/cache profile picture:',
            error,
          );
          // Fallback both to the remote URL on any caching/download error
          set(state => ({ ...state, profilePicture: url, avatar: url }));
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
