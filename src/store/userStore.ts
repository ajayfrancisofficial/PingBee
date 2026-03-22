import { create } from 'zustand';

interface UserState {
  userId: string;
  name: string;
  about: string;
  phoneNumber: string;
  email: string;
  profilePicture: string; // use "" if deleted
  avatar: string;         // use "" if deleted
  setUser: (user: Partial<Omit<UserState, 'setUser' | 'updateProfilePicture' | 'deleteProfilePicture'>>) => void;
  updateProfilePicture: (url: string) => Promise<void>;
  deleteProfilePicture: () => void;
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
  
  updateProfilePicture: async (url: string) => {
    // Instantly set the profile picture for immediate UI feedback
    set((state) => ({ ...state, profilePicture: url }));
    
    try {
      // Create a compressed avatar version
      const { compressImage } = await import('../utils/media/mediaImageGenerator');
      const avatarUrl = await compressImage(url, 0.4); // 40% quality thumbnail
      
      set((state) => ({ ...state, avatar: avatarUrl }));
    } catch (error) {
      console.error('[UserStore] Failed to generate avatar from profile picture', error);
      // Fallback to the original URL if compression fails
      set((state) => ({ ...state, avatar: url }));
    }
  },

  deleteProfilePicture: () => set((state) => ({ 
    ...state, 
    profilePicture: '', 
    avatar: '' 
  })),
}));
