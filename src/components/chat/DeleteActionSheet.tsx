import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheet } from '../foundations/BottomSheet';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

export type DeleteType = 'deleteForEveryone' | 'deleteForMe';

interface DeleteActionSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Number of messages selected – drives the title text */
  selectedCount: number;
  /** Whether the "Delete for Everyone" option should be shown */
  canDeleteForEveryone: boolean;
  onDelete: (type: DeleteType) => void;
}

interface ActionRowProps {
  label: string;
  onPress: () => void;
}

const ActionRow: React.FC<
  ActionRowProps & { styles: ReturnType<typeof makeStyles>; theme: AppTheme }
> = ({ label, onPress, styles, theme }) => (
  <TouchableOpacity
    style={styles.actionRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.actionLabel, { color: theme.colors.semantic.error }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const DeleteActionSheet: React.FC<DeleteActionSheetProps> = ({
  visible,
  onClose,
  selectedCount,
  canDeleteForEveryone,
  onDelete,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const title =
    selectedCount === 1
      ? 'Delete message?'
      : `Delete ${selectedCount} messages?`;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton
    >
      <View style={styles.content}>
        <View style={styles.pillContainer}>
          {canDeleteForEveryone && (
            <>
              <ActionRow
                styles={styles}
                theme={theme}
                label="Delete for everyone"
                onPress={() => onDelete('deleteForEveryone')}
              />
              <View style={styles.separator} />
            </>
          )}

          <ActionRow
            styles={styles}
            theme={theme}
            label="Delete for me"
            onPress={() => onDelete('deleteForMe')}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const makeStyles = ({ spacing, typography, colors, borderRadius }: AppTheme) =>
  StyleSheet.create({
    content: {
      paddingBottom: spacing.md,
    },
    pillContainer: {
      backgroundColor: colors.surfaces.default,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.md,
      overflow: 'hidden',
    },
    actionRow: {
      paddingVertical: spacing.md,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    actionLabel: {
      ...typography.variants.bodyMedium,
      fontWeight: '600',
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borders.separator,
    },
  });
