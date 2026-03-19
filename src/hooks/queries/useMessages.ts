import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { socketService } from '../../services/websocket';
import { IMessage } from 'react-native-gifted-chat';

export interface ExtendedMessage extends Omit<IMessage, 'createdAt'> {
  chatId: string;
  createdAt: Date | number; // Override to allow both Types for GiftedChat
}

const fetchMessages = async (chatId: string): Promise<ExtendedMessage[]> => {
  // Mock fetching messages for a specific chat
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));
  
  // GiftedChat requires the newest messages to be FIRST in the array (index 0)
  return [
    {
      _id: 'm2',
      chatId,
      text: 'This chat magically caches with React Query!',
      createdAt: new Date(Date.now() - 30000), // Newer
      user: {
        _id: '2',
        name: 'Jane Doe',
        avatar: 'https://avatar.iran.liara.run/public/girl',
      },
    },
    {
      _id: 'm1',
      chatId,
      text: 'Hello there! Enjoy testing the GiftedChat.',
      createdAt: new Date(Date.now() - 60000), // Older
      user: {
        _id: 'user-1', // You
        name: 'You',
      },
    }
  ];
};

export const useFetchMessages = (chatId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => fetchMessages(chatId),
  });

  // Example of integrating WebSocket for real-time updates
  useEffect(() => {
    socketService.connect();

    const unsubscribe = socketService.on('onMessage', (newMessage: any) => {
      // If the message is for this chat, append it to the cache
      if (newMessage.chatId === chatId || newMessage.chatId === '1') {
        
        // Morph the backend socket payload into the shape GiftedChat natively expects
        const mappedMessage: ExtendedMessage = {
          _id: newMessage.id,
          chatId: newMessage.chatId,
          text: newMessage.text,
          createdAt: new Date(newMessage.createdAt || Date.now()),
          user: {
            _id: newMessage.senderId,
            name: `User ${newMessage.senderId}`,
            avatar: newMessage.senderId === 'user-1' ? undefined : 'https://avatar.iran.liara.run/public/boy',
          },
        };

        queryClient.setQueryData(['messages', chatId], (oldData: ExtendedMessage[] | undefined) => {
          if (!oldData) return [mappedMessage];
          // Avoid duplicate keys
          if (oldData.find(m => m._id === mappedMessage._id)) return oldData;
          // Prepend at index 0 
          return [mappedMessage, ...oldData];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, queryClient]);

  return query;
};
