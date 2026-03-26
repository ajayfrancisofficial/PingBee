import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalMessages } from '../../hooks/db/useLocalMessages';
import { database } from '../../db';
import Message from '../../db/models/Message';
import { sendMessage } from '../../services/websocket';

interface ChatScreenProps {
  chatId: string;
  currentUserId: string;
}

const ExampleChatScreen: React.FC<ChatScreenProps> = ({ chatId, currentUserId }) => {
  const messages = useLocalMessages(chatId);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const tempId = Math.random().toString(36).substring(7);

    // 1. Save to local DB immediately (Offline-first)
    await database.write(async () => {
      await database.get<Message>('messages').create(msg => {
        msg._raw.id = tempId; // For WatermelonDB, we can set temporary ID if needed, or let it generate
        msg.chatId = chatId;
        msg.senderId = currentUserId;
        msg.text = inputText;
        msg.status = 'pending';
        msg.isMine = true;
        msg.createdAt = Date.now();
      });
      
      // Update chat last Activity
      const chat = await database.get<any>('chats').find(chatId);
      await chat.update((c: any) => {
        c.updatedAt = Date.now();
      });
    });

    // 2. Clear input
    const textToSend = inputText;
    setInputText('');

    // 3. Send via WebSocket
    sendMessage({
      type: 'MSG',
      payload: {
        tempId,
        chatId,
        text: textToSend,
        senderId: currentUserId,
      }
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.isMine ? styles.myMessage : styles.theirMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messageBubble: { padding: 10, margin: 5, borderRadius: 10, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  messageText: { fontSize: 16 },
  statusText: { fontSize: 10, alignSelf: 'flex-end', color: '#888' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  sendButton: { marginLeft: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#075E54', borderRadius: 20, paddingHorizontal: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default ExampleChatScreen;
