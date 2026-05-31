import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  LinearTransition,
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Pencil,
  Plus,
  StickyNote,
  Camera,
  Mic,
  SendHorizontal,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import Message from '../../db/models/Message';
import { ReplyPreviewBar } from './ReplyPreviewBar';

export interface MessageInputProps {
  /** Controlled text value */
  value: string;
  onChangeText: (text: string) => void;
  /** Called when the send button is pressed (text is guaranteed non-empty) */
  onSend: () => void;

  // Reply mode
  replyingTo: Message | null;
  replyingToSenderName: string;
  onClearReply: () => void;

  // Edit mode
  editingMessage: Message | null;
  onCancelEdit: () => void;

  /**
   * Called whenever the user's typing state changes.
   * true = user started typing, false = user cleared input.
   * The parent hook (useTypingIndicator) owns the debounce.
   */
  onTyping?: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSend,
  replyingTo,
  replyingToSenderName,
  onClearReply,
  editingMessage,
  onCancelEdit,
  onTyping,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const canSend = value.trim().length > 0;

  // Shared values for animation control
  const replyVisible = useSharedValue(0);
  const editVisible = useSharedValue(0);

  // Refs to keep content mounted during exit animations
  const lastReplyingTo = useRef<Message | null>(null);
  const lastSenderName = useRef<string>('');
  const lastEditingMessage = useRef<Message | null>(null);

  // Clear reply mode if editing mode is entered
  useEffect(() => {
    if (editingMessage && replyingTo) {
      onClearReply();
    }
  }, [editingMessage, replyingTo, onClearReply]);

  if (replyingTo && !editingMessage) {
    lastReplyingTo.current = replyingTo;
    lastSenderName.current = replyingToSenderName;
  }
  if (editingMessage) {
    lastEditingMessage.current = editingMessage;
  }

  // Drive animation values using timing transitions
  useEffect(() => {
    const isReplyVisible = replyingTo && !editingMessage;
    replyVisible.value = withTiming(isReplyVisible ? 1 : 0, {
      duration: 200,
    });
  }, [replyingTo, editingMessage, replyVisible]);

  useEffect(() => {
    editVisible.value = withTiming(editingMessage ? 1 : 0, {
      duration: 200,
    });
  }, [editingMessage, editVisible]);

  // Animates container heights and translateY to slide from behind the input row in normal flow
  const replyContainerStyle = useAnimatedStyle(() => {
    return {
      height: replyVisible.value * 52,
      opacity: replyVisible.value,
    };
  });

  const replyAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -52 * (1 - replyVisible.value) }],
    };
  });

  const editContainerStyle = useAnimatedStyle(() => {
    return {
      height: editVisible.value * 36,
      opacity: editVisible.value,
    };
  });

  const editAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -36 * (1 - editVisible.value) }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
      ]}
    >
      {/* ── Reply preview strip ── */}
      <Animated.View style={[replyContainerStyle, styles.previewWrapper]}>
        <Animated.View style={[replyAnimatedStyle, { height: 52 }]}>
          {lastReplyingTo.current && (
            <ReplyPreviewBar
              replyingTo={lastReplyingTo.current}
              senderName={lastSenderName.current}
              onClear={onClearReply}
            />
          )}
        </Animated.View>
      </Animated.View>

      {/* ── Edit-mode indicator ── */}
      <Animated.View style={[editContainerStyle, styles.previewWrapper]}>
        <Animated.View style={[editAnimatedStyle, { height: 36 }]}>
          {lastEditingMessage.current && (
            <View style={styles.editBar}>
              <Pencil
                size={theme.sizing.iconSizes.sm}
                color={theme.colors.brand.primary}
              />
              <Text style={styles.editLabel} numberOfLines={1}>
                Editing message
              </Text>
              <TouchableOpacity
                onPress={onCancelEdit}
                activeOpacity={0.7}
                style={styles.editClearButton}
              >
                <X
                  size={theme.sizing.iconSizes.md}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>

      {/* ── Input row ── */}
      <View style={styles.inputRow}>
        {/* Far-left Plus button */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Plus size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        {/* TextInput Pill */}
        <Animated.View
          style={styles.pillContainer}
          layout={LinearTransition.duration(200)}
        >
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={text => {
              onChangeText(text);
              onTyping?.(text.length > 0);
            }}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            maxLength={4000}
            returnKeyType="default"
          />
          {/* Inside-pill StickyNote button */}
          <Animated.View layout={LinearTransition.duration(200)}>
            <TouchableOpacity style={styles.stickerButton} activeOpacity={0.7}>
              <StickyNote size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Right controls (Camera + Mic or Send) */}
        {!canSend ? (
          <Animated.View
            style={styles.rightControlsContainer}
            entering={SlideInRight.duration(150)}
            exiting={SlideOutRight.duration(150)}
            layout={LinearTransition.duration(200)}
          >
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Camera size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Mic size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View layout={LinearTransition.duration(200)}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSend}
              activeOpacity={0.7}
            >
              <SendHorizontal size={24} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgrounds.elevated,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borders.separator,
      overflow: 'hidden',
    },
    previewWrapper: {
      overflow: 'hidden',
      width: '100%',
    },

    // Edit-mode indicator bar (fixed height to allow clean absolute positioning)
    editBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      height: 36,
      backgroundColor: colors.surfaces.default,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borders.separator,
      gap: spacing.sm,
      zIndex: 1,
    },
    editLabel: {
      ...typography.variants.caption,
      color: colors.brand.primary,
      fontWeight: '500',
      flex: 1,
    },
    editClearButton: {
      padding: spacing.xs,
    },

    // Text input row
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: spacing.sm,
      paddingRight: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: colors.backgrounds.elevated,
      zIndex: 1,
    },
    pillContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaces.default,
      borderRadius: borderRadius.pill,
      borderWidth: 1,
      borderColor: colors.borders.separator,
      paddingHorizontal: spacing.sm,
      marginHorizontal: spacing.sm,
    },
    textInput: {
      flex: 1,
      minHeight: 36,
      maxHeight: 100,
      paddingVertical: 8,
      paddingRight: spacing.xs,
      ...typography.variants.body,
      color: colors.text.primary,
    },
    stickerButton: {
      padding: spacing.xs,
    },
    iconButton: {
      padding: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightControlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
