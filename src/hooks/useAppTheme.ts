import { useEffect, useState, useMemo } from 'react';
import { Appearance } from 'react-native';
import { useThemeStore } from '../store/ThemeStore';
import { getTheme, type AppTheme } from '../theme';

/**
 * Returns the resolved AppTheme plus current window dimensions.
 * Dimensions are kept in sync automatically via themeStore.
 */
export const useAppTheme = (): AppTheme => {
  const colorScheme = useThemeStore(state => state.colorScheme);
  const resolvedColorScheme = useThemeStore(state => state.resolvedColorScheme);
  const width = useThemeStore(state => state.width);
  const height = useThemeStore(state => state.height);
  const scale = useThemeStore(state => state.scale);
  const fontScale = useThemeStore(state => state.fontScale);
  const isPortrait = useThemeStore(state => state.isPortrait);

  const [theme, setTheme] = useState<AppTheme>(() => getTheme(resolvedColorScheme()));

  useEffect(() => {
    // Update immediately when colorScheme changes
    setTheme(getTheme(resolvedColorScheme()));

    if (colorScheme === 'system') {
      // Listen for OS-level appearance changes
      const subscription = Appearance.addChangeListener(({ colorScheme: scheme }) => {
        setTheme(getTheme(scheme === 'dark' ? 'dark' : 'light'));
      });
      return () => subscription.remove();
    }
  }, [colorScheme, resolvedColorScheme]);

  return useMemo(
    () => ({ ...theme, width, height, scale, fontScale, isPortrait, colorScheme }),
    [theme, width, height, scale, fontScale, isPortrait, colorScheme]
  );
};
