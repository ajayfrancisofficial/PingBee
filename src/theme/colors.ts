/**
 * Bee-themed color palette for PingBee
 *
 * Light: Cream / honey-gold / charcoal
 * Dark:  Deep black / bright amber / soft grays
 */

export interface ThemeColors {
  brand: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
  };
  backgrounds: {
    default: string;
    elevated: string;
  };
  surfaces: {
    default: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    onPrimary: string;
  };
  borders: {
    default: string;
    light: string;
    separator: string;
  };
  semantic: {
    error: string;
    errorBackground: string;
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    info: string;
    infoBackground: string;
  };
  absolute: {
    white: string;
    black: string;
    transparent: string;
  };
}

export const lightColors: ThemeColors = {
  brand: {
    primary: '#F5A623',       // Honey Gold
    primaryDark: '#C4841D',   // Deep Amber
    secondary: '#3C3C3C',     // Warm Charcoal
    accent: '#FFD700',        // Bee Stripe Gold
  },
  backgrounds: {
    default: '#FFFDF7',       // Cream White
    elevated: '#FFFFFF',      // Pure White (modals, sheets)
  },
  surfaces: {
    default: '#FFF8ED',       // Soft Honey
    secondary: '#FFF1DC',     // Warm Honey Tint
    tertiary: '#FFE8C2',      // Deep Honey Tint
  },
  text: {
    primary: '#1C1C1E',       // Near Black
    secondary: '#8E8E93',     // Muted Gray
    tertiary: '#C7C7CC',      // Light Gray
    inverse: '#FFFFFF',       // White on dark backgrounds
    onPrimary: '#FFFFFF',     // White on primary buttons
  },
  borders: {
    default: '#E8D5B5',       // Light Honey
    light: '#F0E6D2',         // Faint Honey
    separator: '#E5DFD6',     // Subtle separator
  },
  semantic: {
    error: '#FF3B30',
    errorBackground: '#FFF0EF',
    success: '#34C759',
    successBackground: '#EDFCF2',
    warning: '#FF9500',
    warningBackground: '#FFF8EC',
    info: '#007AFF',
    infoBackground: '#EBF5FF',
  },
  absolute: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
};

export const darkColors: ThemeColors = {
  brand: {
    primary: '#FFB833',       // Bright Amber
    primaryDark: '#D4922A',   // Dark Honey
    secondary: '#E5E5EA',     // Light Gray
    accent: '#FFD700',        // Bee Stripe Gold
  },
  backgrounds: {
    default: '#1A1A1A',       // Deep Black
    elevated: '#2C2C2E',      // Elevated Surface
  },
  surfaces: {
    default: '#2C2C2E',       // Dark Surface
    secondary: '#3A3A3C',     // Lighter Dark Surface
    tertiary: '#48484A',      // Tertiary Dark Surface
  },
  text: {
    primary: '#F5F5F5',       // Off White
    secondary: '#A1A1A6',     // Muted Light
    tertiary: '#636366',      // Dimmed
    inverse: '#1C1C1E',       // Dark on light backgrounds
    onPrimary: '#1A1A1A',     // Dark on primary buttons
  },
  borders: {
    default: '#48484A',       // Dark Border
    light: '#3A3A3C',         // Subtle Dark Border
    separator: '#38383A',     // Dark separator
  },
  semantic: {
    error: '#FF453A',
    errorBackground: '#3A1D1B',
    success: '#30D158',
    successBackground: '#1B3A24',
    warning: '#FF9F0A',
    warningBackground: '#3A2D1B',
    info: '#0A84FF',
    infoBackground: '#1B2A3A',
  },
  absolute: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
};
