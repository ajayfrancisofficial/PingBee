import React, { useLayoutEffect, useCallback, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useLocalMessages } from '../hooks/db/useLocalMessages';
import { sendMessage } from '../services/messageController';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { AppTheme } from '../theme';
import Message from '../db/models/Message';

/** Map a WatermelonDB Message record into GiftedChat's IMessage format */
const mapToGiftedChat = (msg: Message, currentUserId: string): IMessage => ({
  _id: msg.id,
  text: msg.text,
  createdAt: new Date(msg.createdAt),
  user: {
    _id: msg.senderId,
    name: msg.senderId === currentUserId ? 'You' : `User ${msg.senderId}`,
  },
  pending: msg.status === 'pending',
  sent: msg.status === 'sent',
  received: msg.status === 'delivered' || msg.status === 'read',
  ...(msg.mediaUrl && msg.mediaType === 'image' && { image: msg.mediaUrl }),
  ...(msg.mediaUrl && msg.mediaType === 'video' && { video: msg.mediaUrl }),
});

const ChatScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { name, chatId } = route.params;
  const { userId, avatar, name: userName } = useUserStore();
  const user = { _id: userId, avatar, name: userName };
  const setActiveChatId = useChatStore(s => s.setActiveChatId);

  // Observe messages from WatermelonDB (auto-updates on any DB change)
  const rawMessages = useLocalMessages(chatId);
  const messages = useMemo(
    () => rawMessages.map(msg => mapToGiftedChat(msg, userId)),
    [rawMessages, userId],
  );

  const [replyMessage, setReplyMessage] = useState<any>(null);
  const appTheme = useAppTheme();
  const styles = useMemo(() => makeStyles(appTheme), [appTheme]);

  // Track active chat for unread count logic
  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [navigation, name, chatId, setActiveChatId]);

  // Handle when user hits SEND in GiftedChat
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const msg = newMessages[0];
      sendMessage(msg, chatId);
      setReplyMessage(null);
    },
    [chatId],
  );

  const onSwipe = (message: any) => {
    console.log('🚀 ~ onSwipe ~ message:', message);
    setReplyMessage(message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messagesContainerStyle={{ borderWidth: 1 }}
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
        listProps={{ keyboardShouldPersistTaps: 'handled' }}
        reply={{
          swipe: {
            isEnabled: true,
            direction: 'left',
            onSwipe: onSwipe,
          },
          message: replyMessage,
          onClear: () => setReplyMessage(null),
        }}
      />
    </SafeAreaView>
  );
};

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgrounds.default },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });

export default ChatScreen;
