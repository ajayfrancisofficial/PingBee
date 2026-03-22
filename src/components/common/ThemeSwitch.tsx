import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sun, Moon, SunMoon } from 'lucide-react-native';
import { Menu, type MenuItem } from '../foundations/Menu';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useThemeStore, type ColorScheme } from '../../store/ThemeStore';
import { AppTheme } from '../../theme';
import { sizing } from '../../theme/sizing';

const SCHEME_CONFIG: {
  value: ColorScheme;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: SunMoon },
];

export const ThemeSwitch: React.FC = () => {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const colorScheme = useThemeStore(state => state.colorScheme);
  const setColorScheme = useThemeStore(state => state.setColorScheme);

  // The active scheme's icon is shown as the trigger button
  const activeConfig =
    SCHEME_CONFIG.find(s => s.value === colorScheme) ?? SCHEME_CONFIG[2];
  const ActiveIcon = activeConfig.Icon;

  const menuItems: MenuItem[] = SCHEME_CONFIG.map(({ value, label, Icon }) => ({
    label,
    isActive: colorScheme === value,
    icon: (
      <Icon
        size={sizing.iconSizes.base}
        color={
          colorScheme === value ? colors.brand.primary : colors.text.secondary
        }
      />
    ),
    onPress: () => setColorScheme(value),
  }));

  return (
    <Menu
      items={menuItems}
      align="right"
      trigger={
        <View style={styles.triggerButton}>
          <ActiveIcon size={sizing.iconSizes.base} color={colors.text.primary} />
        </View>
      }
    />
  );
};

const makeStyles = ({ colors, spacing, borderRadius }: AppTheme) =>
  StyleSheet.create({
    triggerButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaces.default,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borders.light,
    },
  });
