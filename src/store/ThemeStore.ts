import { create } from 'zustand';
import { Appearance, Dimensions } from 'react-native';
import { getStringItem, setStringItem } from '../utils/mmkvStorage';
import { COLOR_SCHEME_STORAGE_KEY } from '../constants/staticVariables';


export type ColorScheme = 'light' | 'dark' | 'system';

const getInitialColorScheme = (): ColorScheme => {
  const stored = getStringItem(COLOR_SCHEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

const getWindowDimensions = () => {
  const { width, height, scale, fontScale } = Dimensions.get('window');
  return { width, height, scale, fontScale, isPortrait: height >= width };
};

interface ThemeState {
  // Color scheme
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  resolvedColorScheme: () => 'light' | 'dark';

  // Window dimensions
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  isPortrait: boolean;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: getInitialColorScheme(),

  setColorScheme: (scheme) => {
    setStringItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    set({ colorScheme: scheme });
  },

  resolvedColorScheme: () => {
    const { colorScheme } = get();
    if (colorScheme === 'system') {
      return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    }
    return colorScheme;
  },

  ...getWindowDimensions(),
}));

// Self-contained: subscribe to dimension changes at module load time.
// Fires whenever the device rotates or the window is resized.
Dimensions.addEventListener('change', ({ window }) => {
  const { width, height, scale, fontScale } = window;
  useThemeStore.setState({
    width,
    height,
    scale,
    fontScale,
    isPortrait: height >= width,
  });
});
