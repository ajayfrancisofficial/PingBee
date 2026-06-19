import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme/index';

interface AiChatbotFabProps {
  onPress: () => void;
}

export const AiChatbotFab: React.FC<AiChatbotFabProps> = ({ onPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      onPress={onPress}
    >
      <Sparkles
        color={theme.colors.text.onPrimary}
        size={theme.sizing.iconSizes.lg}
      />
    </Pressable>
  );
};

const makeStyles = ({ colors, spacing, borderRadius }: AppTheme) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: borderRadius.pill,
      backgroundColor: colors.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.absolute.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    fabPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
  });
