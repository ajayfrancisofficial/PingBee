import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Swipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  Check,
  CheckCheck,
  Clock,
  Reply,
  User,
  Pencil,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import Message from '../../db/models/Message';
import { formatMessageTime } from '../../utils/DateTimeUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageBubbleProps {
  message?: Message;
  repliedMessage?: Message;
  repliedSenderName?: string;
  senderName: string;
  isSelectionMode: boolean;
  isSelected: boolean;
  onLongPress: (message: Message) => void;
  onPress: (message: Message) => void;
  onReply: (message: Message) => void;
  // Primitive values passed to trigger React.memo re-render on database changes
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  text?: string;
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  isGroup: boolean;
  /** When true, renders animated typing dots instead of message content */
  isTypingIndicator?: boolean;
  /** When true, highlights the bubble as currently editing */
  isEditing?: boolean;
}

// ─── SelectionCheckbox ────────────────────────────────────────────────────────

interface CheckboxProps {
  visible: boolean;
  selected: boolean;
  theme: AppTheme;
}

/**
 * Animated circular checkbox that slides in from the left when multi-select
 * mode is active. Width springs between 0 and 40 to reveal/hide the checkbox.
 */
const SelectionCheckbox: React.FC<CheckboxProps> = ({
  visible,
  selected,
  theme,
}) => {
  const widthAV = useSharedValue(visible ? 40 : 0);

  useEffect(() => {
    widthAV.value = withTiming(visible ? 40 : 0, {
      duration: 200,
      easing: Easing.linear,
    });
  }, [visible, widthAV]);

  const animStyle = useAnimatedStyle(() => ({
    width: widthAV.value,
    opacity: interpolate(widthAV.value, [0, 40], [0, 1]),
    overflow: 'hidden',
  }));

  return (
    <Animated.View
      style={[animStyle, { alignItems: 'center', justifyContent: 'center' }]}
    >
      <View
        style={[
          checkboxStyles.circle,
          selected
            ? {
                backgroundColor: theme.colors.brand.primary,
                borderColor: theme.colors.brand.primary,
              }
            : {
                backgroundColor: theme.colors.absolute.transparent,
                borderColor: theme.colors.borders.default,
              },
        ]}
      >
        {selected && (
          <Check
            size={12}
            color={theme.colors.absolute.white}
            strokeWidth={3}
          />
        )}
      </View>
    </Animated.View>
  );
};

const checkboxStyles = StyleSheet.create({
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── TypingDots ───────────────────────────────────────────────────────────────

const DOT_SIZE = 8;
const DOT_TRAVEL = 5;
const DOT_DURATION = 350;
const DOT_DELAYS = [0, 150, 300];

/**
 * Three animated dots that bounce in a rolling wave — used inside the
 * typing indicator bubble.
 */
const TypingDots: React.FC<{ theme: AppTheme }> = ({ theme }) => {
  const dot0 = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dots = [dot0, dot1, dot2];

  useEffect(() => {
    dots.forEach((sv, i) => {
      sv.value = withDelay(
        DOT_DELAYS[i],
        withRepeat(
          withSequence(
            withTiming(-DOT_TRAVEL, { duration: DOT_DURATION }),
            withTiming(0, { duration: DOT_DURATION }),
          ),
          -1,
          false,
        ),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dotStyles = dots.map(sv =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ transform: [{ translateY: sv.value }] })),
  );

  return (
    <View style={typingDotsStyles.row}>
      {dots.map((_, i) => (
        <Animated.View
          key={i}
          style={[
            typingDotsStyles.dot,
            { backgroundColor: theme.colors.text.secondary },
            dotStyles[i],
          ]}
        />
      ))}
    </View>
  );
};

const typingDotsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});

// ─── TickIndicator ────────────────────────────────────────────────────────────

interface TickProps {
  status: Message['status'];
  isMine: boolean;
  theme: AppTheme;
}

const TickIndicator: React.FC<TickProps> = ({ status, isMine, theme }) => {
  const size = theme.sizing.iconSizes.xs;
  const readColor = theme.colors.semantic.info; // blue for read status
  const defaultColor = theme.colors.text.secondary;

  if (status === 'pending') {
    return <Clock size={size} color={defaultColor} />;
  }
  if (status === 'sent') {
    return <Check size={size} color={defaultColor} />;
  }
  // delivered or read
  return (
    <CheckCheck
      size={size}
      color={status === 'read' ? readColor : defaultColor}
    />
  );
};

// ─── MessageBubble ────────────────────────────────────────────────────────────

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({
    message,
    repliedMessage,
    repliedSenderName,
    senderName,
    isSelectionMode,
    isSelected,
    onLongPress,
    onPress,
    onReply,
    isGroup,
    isTypingIndicator = false,
    isEditing = false,
  }) => {
    const theme = useAppTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const swipeableRef = useRef<SwipeableMethods>(null);

    const isMine = isTypingIndicator ? false : message?.isMine ?? false;
    const isDeleted = isTypingIndicator
      ? false
      : message?.isDeletedForEveryone ?? false;

    const handlePress = useCallback(() => {
      if (message) onPress(message);
    }, [onPress, message]);
    const handleLongPress = useCallback(() => {
      if (message) onLongPress(message);
    }, [onLongPress, message]);
    const handleSwipeOpen = useCallback(
      (_direction: 'left' | 'right') => {
        if (message) onReply(message);
        // Snap back after triggering reply
        swipeableRef.current?.close();
      },
      [onReply, message],
    );

    // Swipe action icon component with scaling and horizontal translation
    const SwipeActionIcon = ({
      progress,
      theme,
      offset,
    }: {
      progress: any;
      theme: any;
      offset: number;
    }) => {
      const animatedStyle = useAnimatedStyle(() => {
        return {
          opacity: interpolate(progress.value, [0, 0.1], [0, 1]),
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [offset, 0]) },
            { scale: interpolate(progress.value, [0, 1], [0.6, 1.2]) },
          ],
        };
      });
      return (
        <Animated.View style={[styles.replyAction, animatedStyle]}>
          <Reply
            size={theme.sizing.iconSizes.md}
            color={theme.colors.brand.primary}
          />
        </Animated.View>
      );
    };

    const renderLeftActions = useCallback(
      (progress: any) => {
        // slide in from left (-30 to 0)
        return (
          <SwipeActionIcon progress={progress} theme={theme} offset={-30} />
        );
      },
      [styles, theme],
    );

    const renderRightActions = useCallback(
      (progress: any) => {
        // slide in from right (30 to 0)
        return (
          <SwipeActionIcon progress={progress} theme={theme} offset={30} />
        );
      },
      [styles, theme],
    );

    const displayText = isDeleted
      ? 'This message was deleted'
      : message?.text ?? '';

    return (
      <Swipeable
        ref={swipeableRef}
        enabled={!isSelectionMode && !isTypingIndicator}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={
          !isMine && !isTypingIndicator ? renderLeftActions : undefined
        }
        renderRightActions={
          isMine && !isTypingIndicator ? renderRightActions : undefined
        }
        leftThreshold={40}
        rightThreshold={40}
        onSwipeableWillOpen={handleSwipeOpen}
      >
        <Pressable
          onPress={isTypingIndicator ? undefined : handlePress}
          onLongPress={isTypingIndicator ? undefined : handleLongPress}
          delayLongPress={350}
          style={styles.row}
        >
          {/* ── Far-left selection checkbox ── */}
          <SelectionCheckbox
            visible={isSelectionMode}
            selected={isSelected}
            theme={theme}
          />

          {/* ── Message row content ── */}
          <View
            style={[
              styles.messageContainer,
              isMine
                ? styles.messageContainerMine
                : styles.messageContainerTheirs,
            ]}
          >
            {/* Avatar — shown for received messages in group chats only */}
            {!isMine && isGroup && (
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <User
                    size={theme.sizing.iconSizes.sm}
                    color={theme.colors.text.secondary}
                  />
                </View>
              </View>
            )}

            {/* ── Bubble wrapper — column so label sits above the bubble ── */}
            <View style={styles.bubbleColumn}>
              {/* Typing label — shown above the bubble for typing indicator */}
              {isTypingIndicator && isGroup && senderName ? (
                <Text style={styles.typingLabel} numberOfLines={1}>
                  {senderName}
                </Text>
              ) : null}

              {/* ── Bubble ── */}
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.bubbleMine : styles.bubbleTheirs,
                  isDeleted && styles.bubbleDeleted,
                  repliedMessage && styles.bubbleWithReply,
                  isEditing && styles.bubbleEditing,
                ]}
              >
                {isTypingIndicator ? (
                  // ── Typing indicator mode: bouncing dots only ──
                  <TypingDots theme={theme} />
                ) : (
                  <>
                    {/* Sender name — received messages only for group chats */}
                    {!isMine && isGroup && (
                      <Text
                        style={[
                          styles.senderName,
                          repliedMessage && {
                            paddingHorizontal:
                              theme.spacing.md - theme.spacing.xs,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {senderName}
                      </Text>
                    )}

                    {/* Reply preview if exists */}
                    {repliedMessage && (
                      <View
                        style={[
                          styles.replyPreviewContainer,
                          isMine && styles.replyPreviewContainerMine,
                        ]}
                      >
                        <View
                          style={[
                            styles.replyAccentBar,
                            {
                              backgroundColor: repliedMessage.isMine
                                ? theme.colors.brand.primary
                                : theme.colors.brand.secondary,
                            },
                          ]}
                        />
                        <View style={styles.replyContent}>
                          <Text
                            style={[
                              styles.replySenderName,
                              isMine && styles.replySenderNameMine,
                            ]}
                            numberOfLines={1}
                          >
                            {repliedSenderName}
                          </Text>
                          <Text
                            style={[
                              styles.replyPreviewText,
                              isMine && styles.textMine,
                            ]}
                            numberOfLines={1}
                          >
                            {repliedMessage.isDeletedForEveryone
                              ? 'This message was deleted'
                              : repliedMessage.text}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Wrap main content to maintain correct padding when reply is present */}
                    <View
                      style={
                        repliedMessage
                          ? styles.mainContentContainerWithReply
                          : undefined
                      }
                    >
                      {/* Message text */}
                      <Text
                        style={[
                          styles.messageText,
                          isMine ? styles.textMine : styles.textTheirs,
                          isDeleted && styles.textDeleted,
                        ]}
                      >
                        {displayText}
                      </Text>

                      {/* Footer: timestamp + ticks */}
                      <View style={styles.footer}>
                        {message?.isEdited && !isDeleted && (
                          <Pencil
                            size={10}
                            color={theme.colors.text.secondary}
                            style={{ marginRight: 2 }}
                          />
                        )}
                        <Text style={styles.timestamp}>
                          {formatMessageTime(Number(message?.createdAt))}
                        </Text>
                        {isMine && message && (
                          <TickIndicator
                            status={message.status}
                            isMine={isMine}
                            theme={theme}
                          />
                        )}
                      </View>
                    </View>
                  </>
                )}
              </View>
              {/* end bubble */}
            </View>
            {/* end bubbleColumn */}
          </View>
          {/* end messageContainer */}
        </Pressable>
      </Swipeable>
    );
  },
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = ({
  colors,
  spacing,
  typography,
  borderRadius,
  sizing,
}: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },

    // Message layout (sent = right-aligned, received = left-aligned + avatar)
    messageContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    messageContainerMine: {
      justifyContent: 'flex-end',
    },
    messageContainerTheirs: {
      justifyContent: 'flex-start',
    },

    // Avatar
    avatarContainer: {
      marginRight: spacing.sm,
      alignSelf: 'flex-end',
      marginBottom: 2,
    },
    avatarCircle: {
      width: sizing.iconSizes.xl,
      height: sizing.iconSizes.xl,
      borderRadius: sizing.iconSizes.xl / 2,
      backgroundColor: colors.surfaces.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Bubble column wrapper (allows typing label to sit above the bubble)
    bubbleColumn: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      maxWidth: '75%',
    },

    // Typing label (e.g. "Alice is typing…") above the typing indicator bubble
    typingLabel: {
      ...typography.variants.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
    },

    // Bubble
    bubble: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      borderRadius: borderRadius.lg,
    },
    bubbleMine: {
      backgroundColor: colors.brand.primary,
      borderBottomRightRadius: borderRadius.sm,
    },
    bubbleTheirs: {
      backgroundColor: colors.backgrounds.elevated,
      borderBottomLeftRadius: borderRadius.sm,
      shadowColor: colors.absolute.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    bubbleDeleted: {
      backgroundColor: colors.surfaces.default,
    },
    bubbleEditing: {
      borderWidth: 1.5,
      borderColor: colors.brand.secondary,
      borderStyle: 'dashed',
    },
    bubbleWithReply: {
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.xs,
      paddingBottom: spacing.xs,
    },
    mainContentContainerWithReply: {
      paddingHorizontal: spacing.md - spacing.xs,
      paddingTop: 2,
      paddingBottom: 0,
    },

    senderName: {
      ...typography.variants.caption,
      color: colors.brand.primary,
      fontWeight: '600',
      marginBottom: 2,
    },

    // Text
    messageText: {
      ...typography.variants.body,
      lineHeight: 20,
    },
    textMine: {
      color: colors.absolute.white,
    },
    textTheirs: {
      color: colors.text.primary,
    },
    textDeleted: {
      color: colors.text.secondary,
      fontStyle: 'italic',
    },
    editedSuffix: {
      fontSize: 11,
      opacity: 0.65,
    },

    // Footer row
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 3,
      gap: 3,
    },
    timestamp: {
      fontSize: 10,
      lineHeight: 12,
      color: colors.text.secondary,
    },

    // Swipe-to-reply action area
    replyAction: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      paddingLeft: spacing.md,
    },
    // Reply preview within bubble
    replyPreviewContainer: {
      flexDirection: 'row',
      backgroundColor: colors.absolute.black + '33', // Even darker black overlay (approx 20%)
      borderTopLeftRadius: borderRadius.md,
      borderTopRightRadius: borderRadius.md,
      borderBottomLeftRadius: borderRadius.sm,
      borderBottomRightRadius: borderRadius.sm,
      overflow: 'hidden',
      padding: spacing.xs,
      marginBottom: spacing.xs,
      alignItems: 'stretch', // ensures the accent bar stretches fully
      alignSelf: 'stretch', // ensures it fills the bubble if the main text is wider
    },
    replyPreviewContainerMine: {
      backgroundColor: colors.absolute.black + '40', // Even darker black overlay over the primary color
    },
    replyAccentBar: {
      width: 4,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
    },
    replyContent: {
      flexShrink: 1, // allows the text to dictate width but shrink/truncate when hitting the bubble's max-width
      justifyContent: 'center',
    },
    replySenderName: {
      ...typography.variants.caption,
      color: colors.brand.primary,
      fontWeight: '600',
      marginBottom: 2,
    },
    replySenderNameMine: {
      color: colors.absolute.white,
    },
    replyPreviewText: {
      ...typography.variants.caption,
      color: colors.text.secondary,
    },
  });
