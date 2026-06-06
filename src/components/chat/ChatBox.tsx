import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  KeyboardChatScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useLocalMessages,
  LocalMessage,
} from '../../hooks/db/useLocalMessages';
import { useSyncChatParticipants } from '../../hooks/db/useSyncChatParticipants';
import { useResolvedSenderNames } from '../../hooks/db/useResolvedSenderNames';
import {
  deleteMessages,
  editMessage,
  sendMessage,
} from '../../services/Chat/messageController';
import { fetchChatIsGroup } from '../../services/Chat/chatController';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useUserStore } from '../../store/userStore';
import { useMultiSelectMode } from '../../hooks/useMultiSelectMode';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import { AppTheme } from '../../theme';
import { ChevronDown } from 'lucide-react-native';
import Message from '../../db/models/Message';
import { getTypingText } from '../../utils/TypingUtils';
import { useChatViewabilityTracker } from '../../hooks/useChatViewabilityTracker';

import { ConfirmationModal } from '../common/ConfirmationModal';
import { DeleteActionSheet, DeleteType } from './DeleteActionSheet';
import { ChatDateSeparator } from './ChatDateSeparator';
import { MessageBubble } from './MessageBubble';
import { ChatBoxFooter } from './ChatBoxFooter';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ChatBoxProps {
  chatId: string;
  /** Fires when the initial message load starts/finishes (for the header spinner). */
  onLoadingChange?: (isLoading: boolean) => void;
}

// ─── Internal list item types ─────────────────────────────────────────────────

type MessageItem = { type: 'message'; message: LocalMessage; id: string };
type SeparatorItem = { type: 'separator'; date: Date; id: string };
/** Typing indicator — prepended at index 0 so it appears at the visual bottom of the inverted FlatList */
type TypingItem = { type: 'typing'; id: 'typing-indicator'; label: string };
type ListItem = MessageItem | SeparatorItem | TypingItem;

// ─── ChatBox ──────────────────────────────────────────────────────────────────

/**
 * ChatBox — the self-contained chat view component.
 *
 * Owns all chat UI logic: message list, multi-select mode, swipe-to-reply,
 * message input (send / edit / reply), delete flow (action sheet + confirmation
 * modal), date separators, and animated per-message selection checkboxes.
 *
 * Exposes only two props:
 *   - `chatId`            which chat to render
 *   - `onLoadingChange`   provides initial-load state for the header spinner
 */
export const ChatBox: React.FC<ChatBoxProps> = ({
  chatId,
  onLoadingChange,
}) => {
  const { userId } = useUserStore();
  const appTheme = useAppTheme();
  const styles = useMemo(() => makeStyles(appTheme), [appTheme]);
  const flatListRef = useRef<FlatList<ListItem>>(null);
  const insets = useSafeAreaInsets();

  // ─── Chat type resolution ───
  const [isGroup, setIsGroup] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const resolveChatType = async () => {
      const isGroupChat = await fetchChatIsGroup(chatId);
      if (isMounted) {
        setIsGroup(isGroupChat);
      }
    };
    resolveChatType();
    return () => {
      isMounted = false;
    };
  }, [chatId]);

  // ─── Data ─────────────────────────────────────────────────────────────────

  const { messages, loadMore, isLoadingMore, isInitialLoading, hasMore } =
    useLocalMessages(chatId, String(userId));

  // Forward loading state so the parent can show a header spinner
  useEffect(() => {
    onLoadingChange?.(isInitialLoading);
  }, [isInitialLoading, onLoadingChange]);

  useSyncChatParticipants(chatId);

  // ─── Sender name resolution ───────────────────────────────────────────────
  const senderNames = useResolvedSenderNames(messages, userId);

  // ─── Typing indicator ─────────────────────────────────────────────────────

  const { typingUserIds, notifyTyping } = useTypingIndicator(chatId);

  /**
   * Builds a group-aware typing label from typer IDs + resolved sender names.
   * Falls back to "typing…" if names haven't resolved yet.
   */
  const typingLabel = useMemo(() => {
    return getTypingText(
      typingUserIds,
      senderNames,
      isGroup ? 'group' : 'individual',
    );
  }, [typingUserIds, senderNames, isGroup]);

  // ─── List data (messages interleaved with date separators) ───────────────
  //
  // messages is DESC (newest first) — ideal for an inverted FlatList.
  // A date separator is inserted after each day boundary so that in the
  // inverted render it appears ABOVE the oldest message of each day group.
  //
  // The TypingItem is PREPENDED at index 0: since the FlatList is inverted,
  // index 0 = visually the bottom-most item, just above the footer.
  //
  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // Prepend typing bubble if someone is typing
    if (typingUserIds.length > 0) {
      items.push({
        type: 'typing',
        id: 'typing-indicator',
        label: typingLabel,
      });
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      items.push({ type: 'message', message: msg, id: `msg-${msg.id}` });

      const next = messages[i + 1] ?? null;
      const day = new Date(Number(msg.createdAt)).toDateString();
      const nextDay = next
        ? new Date(Number(next.createdAt)).toDateString()
        : null;

      if (day !== nextDay) {
        items.push({
          type: 'separator',
          date: new Date(Number(msg.createdAt)),
          id: `sep-${day}`,
        });
      }
    }
    return items;
  }, [messages, typingUserIds, typingLabel]);

  // ─── Input state ──────────────────────────────────────────────────────────

  const [inputText, setInputText] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // ─── Delete state ─────────────────────────────────────────────────────────

  const [deleteType, setDeleteType] = useState<DeleteType | null>(null);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // ─── Multi-select ─────────────────────────────────────────────────────────

  const {
    isSelectionMode,
    selectedIds,
    selectedCount,
    canDeleteForEveryone,
    startSelection,
    toggleSelection,
    clearSelection,
  } = useMultiSelectMode(messages);

  const {
    floatingDate,
    minVisibleIndex,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useChatViewabilityTracker<ListItem>(listData.length);

  const editableSelectedMessage = useMemo<Message | null>(() => {
    if (selectedCount !== 1) return null;
    const [id] = selectedIds;
    return messages.find(m => m.id === id && m.isEditable) ?? null;
  }, [selectedCount, selectedIds, messages]);

  // ─── Actions exposed to the navigation header ─────────────────────────────

  const initiateDelete = useCallback(() => {
    setIsDeleteSheetOpen(true);
  }, []);

  const initiateEdit = useCallback(() => {
    if (!editableSelectedMessage) return;
    setInputText(editableSelectedMessage.text);
    setEditingMessage(editableSelectedMessage);
    clearSelection();
  }, [editableSelectedMessage, clearSelection]);

  // ─── Message handlers ─────────────────────────────────────────────────────

  const handleMessageLongPress = useCallback(
    (msg: Message) => startSelection(msg),
    [startSelection],
  );

  const handleMessagePress = useCallback(
    (msg: Message) => {
      if (isSelectionMode) toggleSelection(msg);
    },
    [isSelectionMode, toggleSelection],
  );

  const handleReply = useCallback((msg: Message) => {
    setReplyingTo(msg);
  }, []);

  // ─── Send / Edit ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    try {
      if (editingMessage) {
        await editMessage(editingMessage.id, text);
        setEditingMessage(null);
      } else {
        await sendMessage(text, chatId, replyingTo?.id);
      }
    } catch (err) {
      console.error('[ChatBox] send/edit failed:', err);
    }
    setInputText('');
    setReplyingTo(null);
    // Clear typing indicator immediately on send
    notifyTyping(false);
  }, [inputText, editingMessage, chatId, replyingTo, notifyTyping]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setInputText('');
  }, []);

  const handleClearReply = useCallback(() => setReplyingTo(null), []);

  // ─── Delete flow ──────────────────────────────────────────────────────────

  const handleDeleteTypeChosen = useCallback((type: DeleteType) => {
    setIsDeleteSheetOpen(false);
    setDeleteType(type);
    setIsDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteType && selectedCount > 0) {
      try {
        await deleteMessages([...selectedIds], deleteType);
      } catch (err) {
        console.error('[ChatBox] Batch delete failed:', err);
      }
    }
    setIsDeleteConfirmOpen(false);
    setDeleteType(null);
    clearSelection();
  }, [deleteType, selectedCount, selectedIds, clearSelection]);

  const cancelDeleteConfirmation = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeleteType(null);
    // Keep selection active so the user can change their mind
  }, []);

  // ─── Derived values ───────────────────────────────────────────────────────

  const replyingToSenderName = useMemo(() => {
    if (!replyingTo) return '';
    if (replyingTo.senderId === String(userId)) return 'You';
    return (
      senderNames.get(replyingTo.senderId) ?? `User ${replyingTo.senderId}`
    );
  }, [replyingTo, userId, senderNames]);

  const deleteConfirmMessage = useMemo(() => {
    const word = selectedCount === 1 ? 'message' : 'messages';
    const pronoun = selectedCount === 1 ? 'this' : 'these';
    return deleteType === 'deleteForEveryone'
      ? `Are you sure you want to delete ${pronoun} ${selectedCount} ${word} for everyone?`
      : `Are you sure you want to delete ${pronoun} ${selectedCount} ${word} for yourself?`;
  }, [selectedCount, deleteType]);

  // ─── FlatList helpers ─────────────────────────────────────────────────────

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  const renderItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => {
      switch (item.type) {
        case 'separator':
          return <ChatDateSeparator date={item.date} />;
        case 'typing':
          return (
            <MessageBubble
              isTypingIndicator
              senderName={item.label}
              isSelectionMode={false}
              isSelected={false}
              onLongPress={() => {}}
              onPress={() => {}}
              onReply={() => {}}
              isGroup={isGroup}
            />
          );
        case 'message':
        default: {
          const { message } = item;
          const senderName =
            message.senderId === String(userId)
              ? 'You'
              : senderNames.get(message.senderId) ?? `User ${message.senderId}`;

          const repliedSenderName = message.replyMessage
            ? message.replyMessage.senderId === String(userId)
              ? 'You'
              : senderNames.get(message.replyMessage.senderId) ??
                `User ${message.replyMessage.senderId}`
            : undefined;

          return (
            <MessageBubble
              message={message}
              senderName={senderName}
              repliedMessage={message.replyMessage}
              repliedSenderName={repliedSenderName}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(message.id)}
              onLongPress={handleMessageLongPress}
              onPress={handleMessagePress}
              onReply={handleReply}
              status={message.status}
              text={message.text}
              isEdited={message.isEdited}
              isDeletedForEveryone={message.isDeletedForEveryone}
              isGroup={isGroup}
              isEditing={editingMessage?.id === message.id}
            />
          );
        }
      }
    },
    [
      userId,
      typingUserIds,
      typingLabel,
      senderNames,
      isSelectionMode,
      selectedIds,
      handleMessageLongPress,
      handleMessagePress,
      handleReply,
      isGroup,
      editingMessage,
    ],
  );

  const renderFooter = useCallback(
    () =>
      isLoadingMore ? (
        <ActivityIndicator
          size="small"
          color={appTheme.colors.brand.primary}
          style={styles.loadMoreSpinner}
        />
      ) : null,
    [isLoadingMore, appTheme.colors.brand.primary, styles.loadMoreSpinner],
  );

  const renderScrollComponent = useCallback(
    (props: any) => (
      <KeyboardChatScrollView offset={insets.bottom} {...props} />
    ),
    [],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Animated.FlatList<ListItem>
        ref={flatListRef}
        data={listData}
        inverted
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderScrollComponent={renderScrollComponent}
        itemLayoutAnimation={LinearTransition.duration(250)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {floatingDate && (
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={styles.floatingHeaderContainer}
          pointerEvents="none"
        >
          <ChatDateSeparator date={floatingDate} floating />
        </Animated.View>
      )}

      {/* Floating Scroll to Bottom Indicator */}
      {minVisibleIndex >= 10 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.scrollToBottomContainer}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.scrollToBottomButton}
            onPress={() =>
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
            }
          >
            <ChevronDown size={22} color={appTheme.colors.brand.primary} />
          </Pressable>
        </Animated.View>
      )}

      {/* Footer: switches between selection toolbar and text input */}
      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <ChatBoxFooter
          isSelectionMode={isSelectionMode}
          selectedCount={selectedCount}
          canEditSelected={editableSelectedMessage !== null}
          canDeleteForEveryone={canDeleteForEveryone}
          cancelSelection={clearSelection}
          initiateEdit={initiateEdit}
          initiateDelete={initiateDelete}
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          replyingTo={replyingTo}
          replyingToSenderName={replyingToSenderName}
          onClearReply={handleClearReply}
          editingMessage={editingMessage}
          onCancelEdit={handleCancelEdit}
          onTyping={notifyTyping}
        />
      </KeyboardStickyView>

      {/* Delete type picker */}
      <DeleteActionSheet
        visible={isDeleteSheetOpen}
        onClose={() => setIsDeleteSheetOpen(false)}
        selectedCount={selectedCount}
        canDeleteForEveryone={canDeleteForEveryone}
        onDelete={handleDeleteTypeChosen}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        visible={isDeleteConfirmOpen}
        title={
          selectedCount === 1
            ? 'Delete Message'
            : `Delete ${selectedCount} Messages`
        }
        message={deleteConfirmMessage}
        onConfirm={confirmDelete}
        onCancel={cancelDeleteConfirmation}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = ({ colors, spacing }: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
    listContent: {
      paddingVertical: spacing.sm,
    },
    loadMoreSpinner: {
      marginVertical: spacing.md,
    },
    floatingHeaderContainer: {
      position: 'absolute',
      top: spacing.sm,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    scrollToBottomContainer: {
      position: 'absolute',
      bottom: spacing.md + 60,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 9,
    },
    scrollToBottomButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.backgrounds.elevated,
      justifyContent: 'center',
      alignItems: 'center',
      // Shadows
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    badgeContainer: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.brand.primary,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
  });
