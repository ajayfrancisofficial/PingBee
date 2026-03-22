import { Dimensions } from 'react-native';
import { lightColors, darkColors, type ThemeColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { sizing } from './sizing';
import type { ColorScheme } from '../store/ThemeStore';

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 24,
  pill: 9999,
};

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  sizing: typeof sizing;
  borderRadius: typeof borderRadius;
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  isPortrait: boolean;
  colorScheme: ColorScheme;
}

const initialWindow = Dimensions.get('window');
const initialDimensions = {
  width: initialWindow.width,
  height: initialWindow.height,
  scale: initialWindow.scale,
  fontScale: initialWindow.fontScale,
  isPortrait: initialWindow.height >= initialWindow.width,
};

export const lightTheme: AppTheme = {
  colors: lightColors,
  spacing,
  typography,
  sizing,
  borderRadius,
  ...initialDimensions,
  colorScheme: 'light',
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  spacing,
  typography,
  sizing,
  borderRadius,
  ...initialDimensions,
  colorScheme: 'dark',
};

/**
 * Returns the full theme object for the given mode.
 */
export const getTheme = (mode: 'light' | 'dark'): AppTheme =>
  mode === 'dark' ? darkTheme : lightTheme;
