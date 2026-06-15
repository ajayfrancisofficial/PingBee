import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import Message from '../../db/models/Message';

interface ReplyPreviewBarProps {
  replyingTo: Message;
  senderName: string;
  onClear: () => void;
}

export const ReplyPreviewBar: React.FC<ReplyPreviewBarProps> = ({
  replyingTo,
  senderName,
  onClear,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const previewText = replyingTo.isDeletedForEveryone
    ? 'This message was deleted'
    : replyingTo.text;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.accentBar,
          {
            backgroundColor: replyingTo.isMine
              ? theme.colors.brand.primary
              : theme.colors.brand.secondary,
          },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.senderName} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={styles.previewText} numberOfLines={1}>
            {previewText}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onClear}
        activeOpacity={0.7}
        style={styles.clearButton}
      >
        <X
          size={theme.sizing.iconSizes.md}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaces.default,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borders.separator,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 52,
    },
    accentBar: {
      width: 3,
      alignSelf: 'stretch',
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    replyIcon: {
      flexShrink: 0,
    },
    textContainer: {
      flex: 1,
    },
    senderName: {
      ...typography.variants.caption,
      color: colors.brand.primary,
      fontWeight: '600',
    },
    previewText: {
      ...typography.variants.caption,
      color: colors.text.secondary,
    },
    clearButton: {
      padding: spacing.xs,
      marginLeft: spacing.xs,
    },
  });
