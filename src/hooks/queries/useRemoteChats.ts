import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { onMessage, connect } from '../../services/websocket';

// Using JSONPlaceholder /users as dummy chat data for now
export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount?: number;
}

const fetchRemoteChats = async (): Promise<Chat[]> => {
  // Simulate network delay to see the loader in the header
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));
  
  const { data } = await axiosClient.get('/users');
  const baseChats: Chat[] = data.map((user: any) => ({
    id: user.id.toString(),
    name: user.name,
    lastMessage: `Hey, this is ${user.username}!`,
    unreadCount: Math.floor(Math.random() * 3), // Dummy unread count
  }));

  return [
    ...baseChats,
    ...baseChats.map((c) => ({ ...c, id: `${c.id}_copy1`, name: `${c.name} (Copy 1)` })),
    ...baseChats.map((c) => ({ ...c, id: `${c.id}_copy2`, name: `${c.name} (Copy 2)` })),
    ...baseChats.map((c) => ({ ...c, id: `${c.id}_copy3`, name: `${c.name} (Copy 3)` })),
  ];
};

export const useRemoteChats = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: fetchRemoteChats,
  });

  // Listen to WebSocket and natively update the Chats Inbox list cache
  useEffect(() => {
    connect();

    const unsubscribe = onMessage('onMessage', (newMessage: any) => {
      queryClient.setQueryData(['chats'], (oldChats: Chat[] | undefined) => {
        if (!oldChats) return oldChats;

        const chatIndex = oldChats.findIndex(chat => chat.id === newMessage.chatId);
        
        if (chatIndex > -1) {
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
