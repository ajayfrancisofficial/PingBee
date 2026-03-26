import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Message from '../../db/models/Message';

export function useLocalMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const subscription = database
      .get<Message>('messages')
      .query(Q.where('chat_id', chatId), Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe(newMessages => {
        setMessages(newMessages);
      });

    return () => subscription.unsubscribe();
  }, [chatId]);

  return messages;
}
