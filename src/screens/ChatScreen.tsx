import React, { useLayoutEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useFetchMessages } from '../hooks/queries/useMessages';
import { socketService } from '../services/websocket';

const ChatScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { name, chatId } = route.params || { name: 'Chat', chatId: '1' };
    
    // Fetch messages for this specific chat
    const { data: messages = [], isPending } = useFetchMessages(chatId);

    // Apply header title
    useLayoutEffect(() => {
        navigation.setOptions({ title: name });
    }, [navigation, name]);

    // Handle when user hits SEND in GiftedChat
    const onSend = useCallback((newMessages: IMessage[] = []) => {
        const msg = newMessages[0];
        
        // Map GiftedChat object into our backend WebSocket payload structure
        const socketPayload = {
            id: msg._id,
            chatId,
            text: msg.text,
            senderId: msg.user._id, 
            createdAt: msg.createdAt, // Send timestamp
        };
        
        // Pushes the message to WebSocket. The websocket service will echo it locally causing React Query caching.
        socketService.send(socketPayload);
    }, [chatId]);

    if (isPending && messages.length === 0) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
    }

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={msgs => onSend(msgs)}
                user={{
                    _id: 'user-1', // Set our current generic user id
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
