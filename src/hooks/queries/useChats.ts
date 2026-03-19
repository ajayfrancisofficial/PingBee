import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { socketService } from '../../services/websocket';

// Using JSONPlaceholder /users as dummy chat data for now
export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount?: number;
}

const fetchChats = async (): Promise<Chat[]> => {
  // Simulate network delay to see the loader in the header
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));
  
  const { data } = await axiosClient.get('/users');
  return data.map((user: any) => ({
    id: user.id.toString(),
    name: user.name,
    lastMessage: `Hey, this is ${user.username}!`,
    unreadCount: Math.floor(Math.random() * 3), // Dummy unread count
  }));
};

export const useFetchChats = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  });

  // Listen to WebSocket and natively update the Chats Inbox list cache
  useEffect(() => {
    socketService.connect();

    const unsubscribe = socketService.on('onMessage', (newMessage: any) => {
      queryClient.setQueryData(['chats'], (oldChats: Chat[] | undefined) => {
        if (!oldChats) return oldChats;

        const chatIndex = oldChats.findIndex(chat => chat.id === newMessage.chatId);
        
        if (chatIndex > -1) {
          // If the chat already exists in our list, update its last message and move it to the top!
          const updatedChat = {
            ...oldChats[chatIndex],
            lastMessage: newMessage.text,
            unreadCount: (oldChats[chatIndex].unreadCount || 0) + 1,
          };
          
          const newChatsList = [...oldChats];
          newChatsList.splice(chatIndex, 1);
          newChatsList.unshift(updatedChat);
          
          return newChatsList;
        } else {
          // A new conversation started entirely, we prepend it to the Inbox
          const newChat: Chat = {
            id: newMessage.chatId,
            name: `User ${newMessage.senderId}`,
            lastMessage: newMessage.text,
            unreadCount: 1,
          };
          return [newChat, ...oldChats];
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return query;
};
