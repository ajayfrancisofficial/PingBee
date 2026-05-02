/**
 * upsert.ts
 *
 * Batch upsert helpers for WatermelonDB.
 * "Upsert" = update the record if it exists, create it if it doesn't.
 *
 * WatermelonDB does not have a native upsert; we implement it by:
 *   1. Fetching existing IDs from local DB in one query
 *   2. Splitting the incoming array into `toCreate` vs `toUpdate`
 *   3. Running everything as a single database.batch() for atomicity
 */

import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import Chat from './models/Chat';
import Message from './models/Message';
import type {
  ChatItem,
  MessageItem,
} from '../types/ApiTypes/RestApiTypes/restApiTypes';

// ─── Chats ───────────────────────────────────────────────────────────────────

/**
 * Upsert an array of ChatItem objects into the local `chats` table.
 */
export const upsertChats = async (apiChats: ChatItem[]): Promise<void> => {
  if (apiChats.length === 0) return;

  await database.write(async () => {
    const chatsCollection = database.get<Chat>('chats');
    const ids = apiChats.map(c => String(c.conversation_id));

    const existing = await chatsCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(c => [c.id, c]));

    const operations = apiChats.map(api => {
      const id = String(api.conversation_id);
      const existingRecord = existingMap.get(id);

      if (existingRecord) {
        return existingRecord.prepareUpdate(c => {
          c.name = api.username;
          c.type = 'individual';
          c.lastMessageText = api.last_message || undefined;
          c.unreadCount = api.unread_count;
          c.updatedAt = new Date(api.timestamp).getTime();
          c.avatarUrl = undefined;
        });
      } else {
        return chatsCollection.prepareCreate(c => {
          // @ts-ignore
          c._raw.id = id;
          c.name = api.username;
          c.type = 'individual';
          c.lastMessageText = api.last_message || undefined;
          c.unreadCount = api.unread_count;
          c.updatedAt = new Date(api.timestamp).getTime();
          c.avatarUrl = undefined;
        });
      }
    });

    await database.batch(...operations);
  });
};

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Upsert an array of MessageItem objects into the local `messages` table.
 */
export const upsertMessages = async (
  apiMessages: MessageItem[],
  chatId: string,
): Promise<void> => {
  if (apiMessages.length === 0) return;

  await database.write(async () => {
    const messagesCollection = database.get<Message>('messages');
    const ids = apiMessages.map(m => String(m.message_id));

    const existing = await messagesCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(m => [m.id, m]));

    const operations = apiMessages.map(api => {
      const id = String(api.message_id);
      const existingRecord = existingMap.get(id);

      if (existingRecord) {
        return existingRecord.prepareUpdate(m => {
          m.text = api.message;
          m.status = api.is_read ? 'read' : 'sent';
        });
      } else {
        return messagesCollection.prepareCreate(m => {
          // @ts-ignore
          m._raw.id = id;
          m.chatId = chatId;
          m.senderId = String(api.sender_id);
          m.text = api.message;
          m.status = api.is_read ? 'read' : 'sent';
          m.isMine = false; // We only upsert messages from other users via this API
          m.createdAt = new Date(api.created_at).getTime();
        });
      }
    });

    await database.batch(...operations);
  });
};
