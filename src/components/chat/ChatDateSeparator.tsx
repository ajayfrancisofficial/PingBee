import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { formatSeparatorDate } from '../../utils/DateTimeUtils';

interface ChatDateSeparatorProps {
  date: Date;
  /** When true the outer container's vertical padding is removed so the pill
   * can be used as a standalone floating element. */
  floating?: boolean;
}

export const ChatDateSeparator: React.FC<ChatDateSeparatorProps> = ({
  date,
  floating = false,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const label = formatSeparatorDate(date);

  return (
    <View style={[styles.container, floating && styles.containerFloating]}>
      <View style={styles.pill}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </View>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    containerFloating: {
      paddingVertical: 0,
    },
    pill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surfaces.secondary,
      borderRadius: borderRadius.pill,
    },
    text: {
      ...typography.variants.caption,
      color: colors.text.secondary,
      fontWeight: '500',
    },
  });
