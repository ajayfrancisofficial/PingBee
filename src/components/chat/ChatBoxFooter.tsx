import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { X, Pencil, Trash2 } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { MessageInput } from './MessageInput';
import Message from '../../db/models/Message';

export interface ChatBoxFooterProps {
  isSelectionMode: boolean;
  selectedCount: number;
  canEditSelected: boolean;
  canDeleteForEveryone: boolean;
  cancelSelection: () => void;
  initiateEdit: () => void;
  initiateDelete: () => void;

  // MessageInput Props (Matching MessageInputProps exactly)
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  replyingTo: Message | null;
  replyingToSenderName: string;
  onClearReply: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
}

export const ChatBoxFooter: React.FC<ChatBoxFooterProps> = ({
  isSelectionMode,
  selectedCount,
  canEditSelected,
  cancelSelection,
  initiateEdit,
  initiateDelete,

  // MessageInput props
  value,
  onChangeText,
  onSend,
  replyingTo,
  replyingToSenderName,
  onClearReply,
  editingMessage,
  onCancelEdit,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const mode = isSelectionMode ? 'selection' : 'input';

  // Smooth slide and fade transition for the Edit button
  const editStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(canEditSelected ? 38 : 0, { duration: 250 }),
      opacity: withTiming(canEditSelected ? 1 : 0, { duration: 200 }),
      marginLeft: withTiming(canEditSelected ? theme.spacing.md : 0, {
        duration: 250,
      }),
    };
  });

  switch (mode) {
    case 'selection':
      return (
        <Animated.View
          key="selection-footer"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
          ]}
        >
          <View style={styles.selectionRow}>
            {/* Delete button on the far left */}
            <TouchableOpacity
              onPress={initiateDelete}
              disabled={selectedCount === 0}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Trash2
                size={22}
                color={
                  selectedCount > 0
                    ? theme.colors.semantic.error
                    : theme.colors.text.tertiary
                }
              />
            </TouchableOpacity>

            {/* Edit button (smoothly slides to the right of the delete button) */}
            <Animated.View
              style={[
                editStyle,
                {
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <TouchableOpacity
                onPress={initiateEdit}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Pencil size={22} color={theme.colors.brand.primary} />
              </TouchableOpacity>
            </Animated.View>

            {/* Selection count */}
            <Animated.View style={styles.selectionTextContainer}>
              <Text style={styles.selectionText}>{selectedCount} selected</Text>
            </Animated.View>

            {/* Cancel button on the far right */}
            <TouchableOpacity
              onPress={cancelSelection}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <X size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      );

    case 'input':
    default:
      return (
        <Animated.View
          key="input-footer"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <MessageInput
            value={value}
            onChangeText={onChangeText}
            onSend={onSend}
            replyingTo={replyingTo}
            replyingToSenderName={replyingToSenderName}
            onClearReply={onClearReply}
            editingMessage={editingMessage}
            onCancelEdit={onCancelEdit}
          />
        </Animated.View>
      );
  }
};

const makeStyles = ({ colors, spacing, typography }: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgrounds.elevated,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borders.separator,
    },
    selectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md, // More spacing at both ends of the footer (16px)
      height: 52, // Fixed height similar to typical MessageInput height to prevent jumps
    },
    iconButton: {
      padding: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectionTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    selectionText: {
      ...typography.variants.bodyMedium,
      fontWeight: '600',
      color: colors.text.primary,
      marginLeft: spacing.xs,
    },
  });
