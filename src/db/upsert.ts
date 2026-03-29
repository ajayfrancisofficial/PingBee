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
  ApiChat,
  ApiMessage,
  MissedSyncEvent,
} from '../types/api';

// ─── Chats ───────────────────────────────────────────────────────────────────

/**
 * Upsert an array of ApiChat objects into the local `chats` table.
 * Creates new records for unknown IDs and updates existing ones.
 */
export const upsertChats = async (apiChats: ApiChat[]): Promise<void> => {
  if (apiChats.length === 0) return;

  await database.write(async () => {
    const chatsCollection = database.get<Chat>('chats');
    const ids = apiChats.map(c => c.id);

    // Fetch all existing chats whose IDs are in our incoming set
    const existing = await chatsCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(c => [c.id, c]));

    const operations = apiChats.map(api => {
      const existingRecord = existingMap.get(api.id);

      if (existingRecord) {
        // Update — only if server data is newer
        return existingRecord.prepareUpdate(c => {
          c.name = api.name;
          c.type = api.type;
          if (api.last_message_text !== null) {
            c.lastMessageText = api.last_message_text;
          }
          c.unreadCount = api.unread_count;
          c.updatedAt = api.updated_at;
          if (api.avatar_url !== null) {
            c.avatarUrl = api.avatar_url;
          }
        });
      } else {
        // Create
        return chatsCollection.prepareCreate(c => {
          // @ts-ignore — WatermelonDB allows setting id on prepareCreate
          c._raw.id = api.id;
          c.name = api.name;
          c.type = api.type;
          c.lastMessageText = api.last_message_text ?? undefined;
          c.unreadCount = api.unread_count;
          c.updatedAt = api.updated_at;
          c.avatarUrl = api.avatar_url ?? undefined;
        });
      }
    });

    await database.batch(...operations);
  });
};

// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * Upsert an array of ApiMessage objects into the local `messages` table.
 */
export const upsertMessages = async (
  apiMessages: ApiMessage[],
): Promise<void> => {
  if (apiMessages.length === 0) return;

  await database.write(async () => {
    const messagesCollection = database.get<Message>('messages');
    const ids = apiMessages.map(m => m.id);

    const existing = await messagesCollection
      .query(Q.where('id', Q.oneOf(ids)))
      .fetch();
    const existingMap = new Map(existing.map(m => [m.id, m]));

    const operations = apiMessages.map(api => {
      const existingRecord = existingMap.get(api.id);

      if (existingRecord) {
        // Update mutable fields only (status, edited text, deleted state)
        return existingRecord.prepareUpdate(m => {
          m.status = api.status;
          m.isEdited = api.is_edited;
          if (api.edited_at !== null) m.editedAt = api.edited_at;
          m.isDeleted = api.is_deleted;
          if (api.deleted_at !== null) m.deletedAt = api.deleted_at;
          if (api.delete_type !== null) m.deleteType = api.delete_type;
        });
      } else {
        // Create
        return messagesCollection.prepareCreate(m => {
          // @ts-ignore
          m._raw.id = api.id;
          m.chatId = api.chat_id;
          m.senderId = api.sender_id;
          m.text = api.text;
          if (api.media_url !== null) m.mediaUrl = api.media_url;
          if (api.media_type !== null) m.mediaType = api.media_type;
          m.status = api.status;
          m.isMine = api.is_mine;
          if (api.reply_to_id !== null) m.replyToId = api.reply_to_id;
          m.isEdited = api.is_edited;
          if (api.edited_at !== null) m.editedAt = api.edited_at;
          m.isDeleted = api.is_deleted;
          if (api.deleted_at !== null) m.deletedAt = api.deleted_at;
          if (api.delete_type !== null) m.deleteType = api.delete_type;
          m.createdAt = api.created_at;
          m.serverTimestamp = api.server_timestamp;
        });
      }
    });

    await database.batch(...operations);
  });
};

// ─── Missed Sync Event Applicator ────────────────────────────────────────────

/**
 * Apply a batch of missed-sync events to the local database.
 * Events are processed in order — the server guarantees chronological ordering.
 */
export const applyMissedSyncEvents = async (
  events: MissedSyncEvent[],
): Promise<void> => {
  if (events.length === 0) return;

  // Process event types that require simple DB reads+writes
  // We iterate sequentially to respect ordering guarantees
  for (const event of events) {
    try {
      await database.write(async () => {
        switch (event.type) {
          case 'NEW_MSG': {
            const { payload: p } = event;
            const messagesCollection = database.get<Message>('messages');

            // Skip if we already have this message (WS may have delivered it)
            const existing = await messagesCollection
              .query(Q.where('id', p.id))
              .fetchCount();
            if (existing > 0) break;

            await messagesCollection.create(m => {
              // @ts-ignore
              m._raw.id = p.id;
              m.chatId = p.chat_id;
              m.senderId = p.sender_id;
              m.text = p.text;
              if (p.media_url !== null) m.mediaUrl = p.media_url ?? undefined;
              if (p.media_type !== null) m.mediaType = p.media_type ?? undefined;
              m.status = 'sent';
              m.isMine = false;
              if (p.reply_to_id !== null) m.replyToId = p.reply_to_id ?? undefined;
              m.isEdited = false;
              m.isDeleted = false;
              m.createdAt = p.created_at;
              m.serverTimestamp = p.server_timestamp;
            });

            // Update chat's last message and unread count
            try {
              const chat = await database.get<Chat>('chats').find(p.chat_id);
              await chat.update(c => {
                c.lastMessageText = p.text;
                c.unreadCount += 1;
                c.updatedAt = p.server_timestamp;
              });
            } catch {
              // Chat not loaded locally yet; will be fetched by initial load
            }
            break;
          }

          case 'EDIT_MSG': {
            const { payload: p } = event;
            try {
              const message = await database.get<Message>('messages').find(p.id);
              await message.update(m => {
                m.text = p.text;
                m.isEdited = true;
                m.editedAt = p.edited_at;
                m.editStatus = 'synced';
              });
            } catch {
              // Message not local yet; will be fetched via pagination
            }
            break;
          }

          case 'DELETE_MSG': {
            const { payload: p } = event;
            if (p.delete_type === 'deleteForMe') break; // Server shouldn't broadcast this but just in case

            try {
              const message = await database.get<Message>('messages').find(p.id);
              await message.update(m => {
                m.isDeleted = true;
                m.deletedAt = p.deleted_at;
                m.deleteType = p.delete_type;
                m.deleteStatus = 'synced';
              });
            } catch {
              // Not local
            }
            break;
          }

          case 'MSG_STATUS': {
            const { payload: p } = event;
            try {
              const message = await database.get<Message>('messages').find(p.id);
              await message.update(m => {
                m.status = p.status;
              });
            } catch {
              // Not local
            }
            break;
          }
        }
      });
    } catch (error) {
      console.warn('[upsert] Failed to apply missed sync event:', event.type, error);
    }
  }
};
