import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import User from './models/User';
import Chat from './models/Chat';
import Message from './models/Message';
import ChatParticipant from './models/ChatParticipant';

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  dbName: 'pingbeewatermelon',
  schema,
  onSetUpError: error => {
    console.error('WatermelonDB setup error:', error);
  },
});

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [User, Chat, Message, ChatParticipant],
});
