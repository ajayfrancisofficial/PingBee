import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { AppTheme } from './index';

export const getNavigationTheme = (appTheme: AppTheme): Theme => {
  const baseTheme = appTheme.colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  console.log('darkTheme from navigationTheme', DarkTheme);
  console.log('defaultTheme from navigationTheme', DefaultTheme);

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: appTheme.colors.brand.primary,
      background: appTheme.colors.backgrounds.default,
      // Using 'elevated' for cards looks better for headers and bottom tabs than 'default'
      card: appTheme.colors.backgrounds.elevated, 
      text: appTheme.colors.text.primary,
      border: appTheme.colors.borders.separator,
      notification: appTheme.colors.semantic.error,
    },
  };
};
