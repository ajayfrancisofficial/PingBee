import React, {
  useLayoutEffect,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import {
  useNavigation,
  type StaticScreenProps,
} from '@react-navigation/native';
import { GiftedChat, IMessage, ReplyMessage } from 'react-native-gifted-chat';
import { Q } from '@nozbe/watermelondb';
import { useLocalMessages } from '../hooks/db/useLocalMessages';
import { sendMessage } from '../services/Chat/messageController';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { AppTheme } from '../theme';
import Message from '../db/models/Message';
import User from '../db/models/User';
import { database } from '../db';
import { useSyncChatParticipants } from '../hooks/db/useSyncChatParticipants';

/** Map a WatermelonDB Message record into GiftedChat's IMessage format */
const mapToGiftedChat = (
  msg: Message,
  currentUserId: string,
  senderNames: Map<string, string>,
): IMessage => ({
  _id: msg.id,
  text: msg.text,
  createdAt: new Date(msg.createdAt),
  user: {
    _id: msg.senderId,
    name:
      msg.senderId === currentUserId
        ? 'You'
        : senderNames.get(msg.senderId) ?? `User ${msg.senderId}`,
  },
  pending: msg.status === 'pending',
  sent: msg.status === 'sent',
  received: msg.status === 'delivered' || msg.status === 'read',
  ...(msg.mediaUrl && msg.mediaType === 'image' && { image: msg.mediaUrl }),
  ...(msg.mediaUrl && msg.mediaType === 'video' && { video: msg.mediaUrl }),
});

export type ChatScreenParams = { name: string; chatId: string };
type Props = StaticScreenProps<ChatScreenParams>;

const ChatScreen = ({ route }: Props) => {
  const navigation = useNavigation();
  const { name, chatId } = route.params;
  const { userId, avatar, name: userName } = useUserStore();
  const user = useMemo(
    () => ({ _id: String(userId), avatar, name: userName }),
    [userId, avatar, userName],
  );
  const setActiveChatId = useChatStore(s => s.setActiveChatId);

  // Observe messages from WatermelonDB (auto-updates on any DB change)
  const {
    messages: rawMessages,
    loadMore,
    isLoadingMore,
    isInitialLoading,
    hasMore,
  } = useLocalMessages(chatId);

  // Build a senderId → displayName map from the local users table
  const [senderNames, setSenderNames] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    const uniqueIds = [...new Set(rawMessages.map(m => m.senderId))].filter(
      id => id !== String(userId),
    );
    if (uniqueIds.length === 0) return;

    const resolveNames = async () => {
      try {
        const users = await database
          .get<User>('users')
          .query(Q.where('id', Q.oneOf(uniqueIds)))
          .fetch();

        setSenderNames(new Map(users.map(u => [u.id, u.displayName])));
      } catch (err) {
        console.warn('[ChatScreen] Failed to resolve sender names:', err);
      }
    };
    // might need to change the logic here.
    resolveNames();
  }, [rawMessages, userId]);

  const messages = useMemo(
    () =>
      rawMessages.map(msg => mapToGiftedChat(msg, String(userId), senderNames)),
    [rawMessages, userId, senderNames],
  );
  // Sync participant profiles in background
  useSyncChatParticipants(chatId);

  const [replyMessage, setReplyMessage] = useState<ReplyMessage | null>(null);
  const appTheme = useAppTheme();
  const styles = useMemo(() => makeStyles(appTheme), [appTheme]);

  // Track active chat and handle header spinner
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {name}
          </Text>
          {isInitialLoading && (
            <ActivityIndicator
              size="small"
              color={appTheme.colors.brand.primary}
              style={styles.headerSpinner}
            />
          )}
        </View>
      ),
    });
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [
    navigation,
    name,
    chatId,
    setActiveChatId,
    isInitialLoading,
    appTheme,
    styles,
  ]);

  // Handle when user hits SEND in GiftedChat
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const msg = newMessages[0];
      sendMessage(msg, chatId);
      setReplyMessage(null);
    },
    [chatId],
  );

  const scrollToMessage = useCallback((messageId: string) => {
    // TODO: Implement scroll to message
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={msgs => onSend(msgs)}
        user={user}
        isUserAvatarVisible={true}
        isAvatarVisibleForEveryMessage={true}
        isUsernameVisible={true}
        isAvatarOnTop={true}
        isScrollToBottomEnabled={true}
        isSendButtonAlwaysVisible={true}
        textInputProps={{ placeholder: 'Type a message...' }}
        timeFormat="LT"
        dateFormat="LL"
        isTyping={false}
        // @ts-ignore - loadEarlier props exist in GiftedChat but may have typing conflicts with the custom reply prop
        loadEarlier={hasMore}
        // @ts-ignore
        onLoadEarlier={loadMore}
        // @ts-ignore
        isLoadingEarlier={isLoadingMore}
        listProps={{ keyboardShouldPersistTaps: 'handled' }}
        reply={{
          swipe: {
            isEnabled: true,
            direction: 'left',
            onSwipe: setReplyMessage,
          },
          message: replyMessage,
          onClear: () => setReplyMessage(null),
          onPress: msg => scrollToMessage(String(msg._id)),
        }}
      />
    </SafeAreaView>
  );
};

const makeStyles = ({ colors, typography, spacing }: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgrounds.default },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitleText: {
      ...typography.variants.bodyMedium,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    headerSpinner: {
      marginLeft: spacing.sm,
    },
  });

export default ChatScreen;
