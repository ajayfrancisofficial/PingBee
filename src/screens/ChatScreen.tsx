import React, { useLayoutEffect, useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useRemoteMessages } from '../hooks/queries/useRemoteMessages';
import { sendMessage } from '../services/messageController';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { AppTheme } from '../theme';

const ChatScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, chatId } = route.params || { name: 'Chat', chatId: '1' };
  const { userId, avatar, name: userName } = useUserStore();
  const user = { _id: userId, avatar, name: userName };
  const setActiveChatId = useChatStore(s => s.setActiveChatId);

  // Fetch messages for this specific chat
  const { data: messages = [], isPending } = useRemoteMessages(chatId);

  const [replyMessage, setReplyMessage] = useState<any>(null);
  const appTheme = useAppTheme();
  const styles = makeStyles(appTheme);

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

  if (isPending && messages.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  console.log('replymessage', replyMessage);

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
