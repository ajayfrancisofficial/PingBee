import React, { useLayoutEffect, useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useFetchMessages } from '../hooks/queries/useMessages';
import { socketService } from '../services/websocket';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { AppTheme } from '../theme';

const ChatScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, chatId } = route.params || { name: 'Chat', chatId: '1' };
  const { userId, avatar, name: userName } = useUserStore();
  const user = { _id: userId, avatar, name: userName };
  // Fetch messages for this specific chat
  const { data: messages = [], isPending } = useFetchMessages(chatId);
  console.log('🚀 ~ ChatScreen ~ messages:', messages);

  const [replyMessage, setReplyMessage] = useState<any>(null);
  const appTheme = useAppTheme();
  const styles = makeStyles(appTheme);

  // Apply header title
  useLayoutEffect(() => {
    navigation.setOptions({ title: name });
  }, [navigation, name]);
  // Handle when user hits SEND in GiftedChat
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      console.log('🚀 ~ onsend ~ newMessages:', newMessages);
      const msg = newMessages[0];

      // Map GiftedChat object into our backend WebSocket payload structure
      const socketPayload = {
        id: msg._id,
        chatId,
        text: msg.text,
        senderId: msg.user._id,
        createdAt: msg.createdAt, // Send timestamp
        replyMessage: replyMessage || undefined,
      };

      // Pushes the message to WebSocket. The websocket service will echo it locally causing React Query caching.
      socketService.send(socketPayload);
      setReplyMessage(null);
    },
    [chatId, replyMessage],
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
