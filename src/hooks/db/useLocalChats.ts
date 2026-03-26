import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../../db';
import Chat from '../../db/models/Chat';

export function useLocalChats() {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const subscription = database
      .get<Chat>('chats')
      .query(Q.sortBy('updated_at', Q.desc))
      .observe()
      .subscribe(newChats => {
        setChats(newChats);
      });

    return () => subscription.unsubscribe();
  }, []);

  return chats;
}
